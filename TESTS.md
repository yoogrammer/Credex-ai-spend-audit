# TESTS

## Audit Engine Tests

- `tests/auditEngine.test.ts` — covers Cursor plan downgrade, GitHub Copilot redundancy, the no-change path, savings category thresholds, and top-recommendation selection.

## How to Run

```bash
npm test -- --runInBand
```

## Notes

- The test suite uses Jest with `ts-jest` and jsdom.
- Next.js route handlers and UI components are covered by separate manual preview checks during development.
