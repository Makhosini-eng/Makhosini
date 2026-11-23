"""Convert supported local documents to Markdown with optional Docling.

This adapter never fetches a URL. Docling is imported lazily so the core
project and its tests do not require the heavyweight optional dependency.
"""
from __future__ import annotations

import argparse
from pathlib import Path

SUPPORTED_SUFFIXES = {
    ".pdf", ".docx", ".pptx", ".xlsx", ".md", ".markdown",
    ".txt", ".html", ".htm", ".csv", ".rtf", ".odt", ".ods",
}


def convert_local_document(source: str | Path, destination: str | Path, converter=None) -> Path:
    """Convert one local document to Markdown without overwriting an output."""
    source_path = Path(source).expanduser().resolve(strict=True)
    destination_path = Path(destination).expanduser().resolve()

    if not source_path.is_file():
        raise ValueError("Source must be a regular local file")
    if source_path.suffix.lower() not in SUPPORTED_SUFFIXES:
        raise ValueError(f"Unsupported input extension: {source_path.suffix or '(none)'}")
    if source_path == destination_path:
        raise ValueError("Input and output paths must be different")
    if destination_path.exists():
        raise FileExistsError(f"Refusing to overwrite existing output: {destination_path}")

    if converter is None:
        try:
            from docling.document_converter import DocumentConverter
        except ImportError as exc:
            raise RuntimeError(
                "Docling is optional. Install it with: "
                "python -m pip install -r requirements-docling.txt"
            ) from exc
        converter = DocumentConverter()

    result = converter.convert(source_path)
    markdown = result.document.export_to_markdown()
    if not isinstance(markdown, str) or not markdown.strip():
        raise ValueError("Docling returned empty Markdown; no output was written")

    destination_path.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation prevents accidentally overwriting an existing file.
    with destination_path.open("x", encoding="utf-8", newline="\n") as output:
        output.write(markdown)
        if not markdown.endswith("\n"):
            output.write("\n")
    return destination_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert one local document to Markdown using Docling")
    parser.add_argument("source", help="Path to a local PDF, Office, Markdown, text or supported document")
    parser.add_argument("destination", help="New Markdown output path; existing files are never overwritten")
    args = parser.parse_args()
    result = convert_local_document(args.source, args.destination)
    print(f"Converted local document to: {result}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
