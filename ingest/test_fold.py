"""Search-key folding tests.

``server/src/fold.ts`` must produce byte-for-byte the same keys as the functions in
``ingest.py``, or lookups silently miss. Both sides are checked against the same expected
values in ``fixtures/fold_cases.json`` (the TypeScript side is ``server/test/fold.test.ts``).

Run from the repository root:  python -m unittest discover -s ingest -p "test_*.py"
"""

from __future__ import annotations

import json
import unittest
from pathlib import Path

import ingest

CASES = json.loads(
    (Path(__file__).parent / "fixtures" / "fold_cases.json").read_text(encoding="utf-8")
)


class FoldTests(unittest.TestCase):
    def test_cases_are_present(self) -> None:
        self.assertGreater(len(CASES), 5)

    def test_exact_key(self) -> None:
        for case in CASES:
            with self.subTest(input=case["input"]):
                self.assertEqual(ingest.exact_key(case["input"]), case["exact"])

    def test_translit_key(self) -> None:
        for case in CASES:
            with self.subTest(input=case["input"]):
                self.assertEqual(ingest.translit_key(case["input"]), case["translit"])

    def test_strip_key(self) -> None:
        for case in CASES:
            with self.subTest(input=case["input"]):
                self.assertEqual(ingest.strip_key(case["input"]), case["strip"])

    def test_every_headword_gets_three_keys(self) -> None:
        # iter_keys yields one key per kind so that query-time lookups are symmetric
        kinds = {kind for kind, _key in ingest.iter_keys("Fuß")}
        self.assertEqual(kinds, {0, 1, 2})


if __name__ == "__main__":
    unittest.main()
