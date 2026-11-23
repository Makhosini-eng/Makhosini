# CAPITAL KING document intelligence (optional)

This module is a small adapter around the upstream Docling package. It converts a supported **local file** to Markdown. It does not fetch URLs, send documents to an external service, or overwrite an existing output file.

## Install only when needed

```sh
python3 -m venv .venv-docling
. .venv-docling/bin/activate
python -m pip install -r requirements-docling.txt
```

Then convert a local document:

```sh
python -m tools.document_intelligence.convert ./sample.pdf ./output/sample.md
```

Supported input families include PDF, DOCX, XLSX, PPTX, Markdown, text, HTML, CSV and several OpenDocument formats. Check the upstream format matrix before relying on a specific legacy or image/audio format.

## Resource and privacy controls

- Docling is optional and is not imported by the Node.js task engine.
- The first use of some PDF layout/table features can download model assets. Review model licences and storage requirements separately from the MIT code licence.
- Do not process confidential funding, identity, banking, medical, or customer documents in this POC. Use synthetic or public non-sensitive samples.
- Keep the first conversion offline from user data sources; only pass a local file path.
- Output is Markdown and may omit or alter layout details. Human-review tables, figures, footnotes, OCR and numerical values before using extracted content in a decision or application.

## Test status

The adapter's path, output and no-overwrite behaviour can be tested with the standard Python test runner without installing Docling or downloading models:

```sh
python -m unittest tools.document_intelligence.test_convert
```

This tests the adapter contract using a fake converter. It does **not** prove that the full Docling model stack has successfully parsed a real PDF. A real conversion test remains a separate, resource-approved step.
