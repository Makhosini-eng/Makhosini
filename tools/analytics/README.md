# CAPITAL KING analytics (optional)

This optional module uses pandas to produce a monthly paid/refunded transaction summary from a local CSV. It is deliberately separate from the Node.js task engine.

## Install

Requires Python 3.11 or newer.

```sh
python3 -m venv .venv-analytics
. .venv-analytics/bin/activate
python -m pip install -r requirements-analytics.txt
```

## Run against the synthetic fixture

```sh
python -m tools.analytics.revenue_report fixtures/synthetic-transactions.csv ./reports/monthly-revenue.csv
```

The report:
- Includes only `paid` and `refunded` rows.
- Subtracts refunds from paid amounts to calculate net amount.
- Excludes pending and cancelled rows.
- Rejects duplicate transaction IDs, malformed rows and mixed currencies.
- Never converts currencies. Convert each currency using a documented FX source and rate before combining separate currency datasets.

## Important accounting boundary

This is a demonstration report, not an accounting ledger, tax calculation, cash-flow statement, or verified revenue record. It does not reconcile payment processor fees, chargebacks, taxes, settlement dates, or bank deposits. Use actual financial records only in a separately authorised, secure workflow with source reconciliation.

## Test

```sh
python -m unittest tools.analytics.test_revenue_report
```
