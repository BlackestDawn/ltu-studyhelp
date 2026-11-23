# Study Workbench

Study app for two courses:

- **Computer Networks** (`/networks`): *Computer Networking: A Top-Down Approach* (Kurose & Ross, 8th ed.), chapters 1–8, eight modules.
- **Computer and Network Security** (`/security`, Z0026E): *Computer Security: Principles and Practice* (Stallings & Brown, 4th ed.), four modules following the lectures, with practice in the style of the four Canvas quizzes.

Each module has a summary, study notes with interactive models, generated problems with answer checking and worked solutions, a concept check, and links to further resources.

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
    main.js            routing: /, /:course, /:course/:module, /:course/:module/:section
    styles.css
    widgets.js         interactive models for the networks course
    secwidgets.js      interactive models for the security course
    lib/               helpers, router, drill and MCQ engines, progress and checklist stores,
                       crypto.js (networks) and seccrypto.js (security) maths
    views/             home (course list), course page, module page and its five sections
    courses/
      index.js         ordered list of courses
      networks/        index.js describes the course; m1/ … m8/ one folder per module
      security/        index.js describes the course; m1/ … m4/; shared.js
        mN/
          index.js     title, objectives, lectures, reading, lab and quiz
          practice.js  practice problems (drills) and concept-check questions
          study.js     summary, study notes and key terms
```

Each module page has five sections, each with its own URL (a course can rename a section; the security course calls Labs “Practice”):

| Path | Section | Contents |
|---|---|---|
| `/networks/m1` | Summary | big picture, key takeaways, formula sheet, common traps, learning objectives |
| `/networks/m1/notes` | Study notes | one section per topic, with examples, interactive models and key terms |
| `/networks/m1/labs` | Labs / Practice | generated problems with answer checking and worked solutions |
| `/networks/m1/quiz` | Concept check | multiple-choice questions with explanations |
| `/networks/m1/resources` | Resources | reading checklist and the course's further material |

The old addresses `/m1` … `/m8` redirect to `/networks/m1` … and keep the saved reading position.

### Adding a module or a course

1. Copy an existing module folder, e.g. `courses/security/m4/` to `m5/`, and replace its content. The `id` (`m5`) must be unique within its course; it becomes the URL.
2. Import it in its course's `index.js` and append it to `modules`.
3. For a new course, create `courses/<id>/index.js` following `security/index.js` (title, eyebrows, header strip, section labels, a `resources` renderer, a `keyPrefix` for saved state) and add it to `courses/index.js`.

Saved state is keyed by `m.key` (`keyPrefix` + module id), so modules with the same id in different courses don't share progress. Drill ids must be unique across all courses. Interactive models are functions that return an element; attach one to a study-notes section with `widget: widgetName`.

### Saved state and updates

A visitor's lab problems, typed answers and concept-check picks are saved with a fingerprint of the lab's title, tag and pages (or of the question's text and options). If an update changes those, the saved state for that lab or question is dropped and it starts fresh. If you change only a lab's generator logic, for example to fix a wrong answer, add or bump `v` on that lab (`{id: "m1delay", v: 2, …}`) so visitors don't keep an old, saved problem.

## Course books

Page and section numbers refer to Kurose & Ross 8th edition and Stallings & Brown 4th (global) edition. The PDFs, lecture slides and quiz material in `books/` are used only as a local reference while writing content. They are git- and docker-ignored and must not be committed or served.
