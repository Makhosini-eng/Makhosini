"""Build a monthly revenue summary from a local transaction CSV.

Only synthetic transaction data belongs in the committed fixture. This tool
rejects mixed currencies, duplicate IDs and malformed rows rather than
silently producing misleading totals.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

REQUIRED_COLUMNS = {
    "transaction_date", "transaction_id", "product", "amount", "currency", "status"
}
ALLOWED_STATUSES = {"paid", "refunded", "pending", "cancelled"}


def build_monthly_report(source: str | Path) -> tuple[pd.DataFrame, dict[str, object]]:
    path = Path(source).expanduser().resolve(strict=True)
    if not path.is_file():
        raise ValueError("Input must be a regular local CSV file")

    frame = pd.read_csv(path)
    missing = REQUIRED_COLUMNS.difference(frame.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")
    frame = frame[list(sorted(REQUIRED_COLUMNS))].copy()

    if frame.empty:
        raise ValueError("Transaction file contains no rows")
    if frame.isna().any().any():
        raise ValueError("Transaction data contains blank required values")
    if frame["transaction_id"].duplicated().any():
        raise ValueError("Duplicate transaction_id values are not allowed")

    frame["transaction_date"] = pd.to_datetime(frame["transaction_date"], errors="coerce", utc=True)
    if frame["transaction_date"].isna().any():
        raise ValueError("One or more transaction dates are invalid")
    frame["amount"] = pd.to_numeric(frame["amount"], errors="coerce")
    if frame["amount"].isna().any() or (frame["amount"] <= 0).any():
        raise ValueError("Amounts must be finite positive numbers")
    if not frame["amount"].map(lambda value: pd.notna(value) and abs(value) != float("inf")).all():
        raise ValueError("Amounts must be finite positive numbers")

    frame["currency"] = frame["currency"].astype(str).str.upper().str.strip()
    if frame["currency"].nunique() != 1:
        raise ValueError("Mixed currencies cannot be combined; convert them first using a documented FX rate")
    if not frame["status"].isin(ALLOWED_STATUSES).all():
        raise ValueError("Unknown transaction status")

    recognised = frame[frame["status"].isin(["paid", "refunded"])].copy()
    recognised["month"] = recognised["transaction_date"].dt.strftime("%Y-%m")
    recognised["paid_amount"] = recognised["amount"].where(recognised["status"] == "paid", 0.0)
    recognised["refunded_amount"] = recognised["amount"].where(recognised["status"] == "refunded", 0.0)

    report = (
        recognised.groupby("month", as_index=False)[["paid_amount", "refunded_amount"]]
        .sum()
        .sort_values("month")
        .reset_index(drop=True)
    )
    report["net_amount"] = report["paid_amount"] - report["refunded_amount"]

    currency = frame["currency"].iloc[0]
    totals = {
        "currency": currency,
        "paid_amount": round(float(report["paid_amount"].sum()), 2),
        "refunded_amount": round(float(report["refunded_amount"].sum()), 2),
        "net_amount": round(float(report["net_amount"].sum()), 2),
        "included_transactions": int(len(recognised)),
        "excluded_pending_or_cancelled": int(len(frame) - len(recognised)),
    }
    return report, totals


def main() -> int:
    parser = argparse.ArgumentParser(description="Summarise monthly paid and refunded transactions")
    parser.add_argument("source", help="Local transaction CSV")
    parser.add_argument("destination", help="New monthly report CSV; existing files are never overwritten")
    args = parser.parse_args()

    report, totals = build_monthly_report(args.source)
    destination = Path(args.destination).expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("x", encoding="utf-8", newline="") as output:
        report.to_csv(output, index=False)

    print(f"Currency: {totals['currency']}")
    print(f"Paid: {totals['paid_amount']:.2f}")
    print(f"Refunded: {totals['refunded_amount']:.2f}")
    print(f"Net: {totals['net_amount']:.2f}")
    print(f"Included transactions: {totals['included_transactions']}")
    print(f"Excluded pending/cancelled: {totals['excluded_pending_or_cancelled']}")
    print(f"Report written to: {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
