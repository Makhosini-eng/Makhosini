from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from tools.analytics.revenue_report import build_monthly_report


FIXTURE = Path(__file__).resolve().parents[2] / "fixtures" / "synthetic-transactions.csv"


class RevenueReportTests(unittest.TestCase):
    def test_monthly_totals_exclude_pending_and_subtract_refunds(self):
        report, totals = build_monthly_report(FIXTURE)

        self.assertEqual(totals["currency"], "USD")
        self.assertEqual(totals["paid_amount"], 260.0)
        self.assertEqual(totals["refunded_amount"], 25.0)
        self.assertEqual(totals["net_amount"], 235.0)
        self.assertEqual(totals["included_transactions"], 4)
        self.assertEqual(totals["excluded_pending_or_cancelled"], 1)
        self.assertEqual(report["month"].tolist(), ["2026-10", "2026-11"])

    def test_rejects_mixed_currencies(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "mixed.csv"
            source.write_text(
                "transaction_date,transaction_id,product,amount,currency,status\n"
                "2026-10-01,a,Service,10,USD,paid\n"
                "2026-10-02,b,Service,10,ZAR,paid\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "Mixed currencies"):
                build_monthly_report(source)

    def test_rejects_blank_currency(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "blank.csv"
            source.write_text(
                "transaction_date,transaction_id,product,amount,currency,status\\n"
                "2026-10-01,a,Service,10, ,paid\\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "currency cannot be blank"):
                build_monthly_report(source)

    def test_rejects_duplicate_transaction_ids(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "duplicate.csv"
            source.write_text(
                "transaction_date,transaction_id,product,amount,currency,status\n"
                "2026-10-01,a,Service,10,USD,paid\n"
                "2026-10-02,a,Service,10,USD,paid\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "Duplicate"):
                build_monthly_report(source)


if __name__ == "__main__":
    unittest.main()
