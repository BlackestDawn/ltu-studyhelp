# Networks Midterm Workbench

Study app for *Computer Networking: A Top-Down Approach* (Kurose & Ross, 8th ed.), chapters 1–7. Each module has a summary, study notes with interactive models, labs that generate fresh numbers and show worked solutions, a concept check, and links to further resources.

Everything runs in the browser. Progress, ticked objectives, lab answers, concept-check picks, model settings and the reading position on each page are saved in `localStorage`, so they stay on the viewer's own device and survive reloads and app updates.

## Running locally

Requires [Bun](https://bun.sh) 1.4+ (the lockfile format needs 1.4).

```bash
bun install
bun run dev          # http://localhost:3000, hot reload
```

Checks (the same ones CI runs):

```bash
bun run lint                          # ESLint + TypeScript
bun run test                          # unit tests (bun test)
bunx playwright install chromium      # once
bun run test:e2e                      # Playwright suite against the production build
```

Production build:

```bash
bun run build        # bundles server + client into dist/
bun run start        # serves dist/ (respects $PORT)
```

Docker:

```bash
docker build -t ltu-studyhelp .
docker run --rm -p 3000:3000 ltu-studyhelp
```

`GET /health` returns `ok` for container and Cloud Run health checks.

## Deployment

Single branch: every push to `main` runs lint, build and the E2E suite, and if they pass, deploys to Cloud Run. See [deploy/README.md](deploy/README.md) for the workflow, rollback and the one-time GCP and GitHub setup.

## Layout

```
src/
  server.ts            Bun.serve: every path serves the app; "/health" for checks
  index.html           page shell (top bar, app root, footer)
  client/
    main.js            routing: /, /:module, /:module/:section
    styles.css
    widgets.js         interactive models (pipeline, DNS, cwnd, IPv4 header)
    lib/               helpers, router, drill and MCQ engines, progress and checklist stores
    views/             home page, module page, and its five sections
    modules/
      index.js         ordered list of modules
      m1/ … m7/        one folder per module
        index.js       title, objectives, reading, links
        practice.js    labs (drills) and concept-check questions
        study.js       summary, study notes and key terms
```

Each module page has five sections, each with its own URL:

| Path | Section | Contents |
|---|---|---|
| `/m1` | Summary | big picture, key takeaways, formula sheet, common traps, learning objectives |
| `/m1/notes` | Study notes | one section per book chapter section, with examples, interactive models and key terms |
| `/m1/labs` | Labs | generated problems with answer checking and worked solutions |
| `/m1/quiz` | Concept check | multiple-choice questions with explanations |
| `/m1/resources` | Resources | reading checklist, book problems, authors' interactive exercises |

### Adding a module

1. Copy an existing folder, e.g. `modules/m4/` to `modules/m5/`, and replace its content. Keep the `id` (`m5`) unique; it becomes the URL.
2. Import it in `modules/index.js` and append it to `MODULES`.

Interactive models are plain functions in `widgets.js` that return an element; attach one to a study-notes section with `widget: widgetName`.

### Saved state and updates

A visitor's lab problems, typed answers and concept-check picks are saved with a fingerprint of the lab's title, tag and pages (or of the question's text and options). If an update changes those, the saved state for that lab or question is dropped and it starts fresh. If you change only a lab's generator logic, for example to fix a wrong answer, add or bump `v` on that lab (`{id: "m1delay", v: 2, …}`) so visitors don't keep an old, saved problem.

## Course book

Page and section numbers refer to the 8th edition. The PDF is used only as a local reference while writing content. It is git- and docker-ignored and must not be committed or served.
