# Smart Campus Room Availability Checker - Practice #13

AI-Driven Software Engineering (KBTU), Practice #13: the same feature built two ways and compared.
Tukubayev Kudaibergen, 24B031114. AI tool: Claude Opus 5.5.

| | Code-based | Low-code |
|-|------------|----------|
| Live demo | https://claude.ai/artifact/7hLog28ZmLb6RsnG6f3RvQ | https://app.appsmith.com/app/smart-campus-checker-p13-low-code/page1-6b05a3dd177cd4bd6b01e9ba |
| Source | `code-based/` (HTML/JS, no dependencies) | `low-code/` (Appsmith JS object + app export JSON) |
| Acceptance tests T1-T8 | 8 / 8 | 8 / 8 |

- `baseline/` - frozen Practice #11/#12 engine and its checks (8 / 8).
- `code-based/src/rules.js` validation + availability, `ui.js` display, `cases.js` shared T1-T8 inputs; `build.js` makes `index.html`.
- `report/` - report (docx and md) and all screenshots; `evidence/` - raw test output and the time log.

Run the code-based tests (Node 18+):

```
cd code-based && node --test tests/acceptance.test.js && node build.js
```

All data is fictional. No login, payment, personal data or database.
