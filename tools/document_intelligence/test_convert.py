from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from tools.document_intelligence.convert import convert_local_document


class FakeDocument:
    def export_to_markdown(self):
        return "# Synthetic proposal\n\nThis is test content only."


class FakeResult:
    document = FakeDocument()


class FakeConverter:
    def __init__(self):
        self.seen_source = None

    def convert(self, source):
        self.seen_source = Path(source)
        return FakeResult()


class DoclingAdapterTests(unittest.TestCase):
    def test_converts_local_markdown_using_injected_converter(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "sample.md"
            output = root / "out" / "sample-converted.md"
            source.write_text("# Input", encoding="utf-8")
            converter = FakeConverter()

            result = convert_local_document(source, output, converter=converter)

            self.assertEqual(result, output.resolve())
            self.assertEqual(converter.seen_source, source.resolve())
            self.assertIn("Synthetic proposal", output.read_text(encoding="utf-8"))

    def test_refuses_to_overwrite_existing_output(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "sample.md"
            output = root / "existing.md"
            source.write_text("# Input", encoding="utf-8")
            output.write_text("keep me", encoding="utf-8")

            with self.assertRaises(FileExistsError):
                convert_local_document(source, output, converter=FakeConverter())

            self.assertEqual(output.read_text(encoding="utf-8"), "keep me")

    def test_rejects_unsupported_file_type(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "sample.exe"
            source.write_text("not a document", encoding="utf-8")
            output = Path(temporary) / "output.md"

            with self.assertRaises(ValueError):
                convert_local_document(source, output, converter=FakeConverter())


if __name__ == "__main__":
    unittest.main()
