# Networks Midterm Workbench

Practice labs, interactive models and concept checks for *Computer Networking: A Top-Down Approach* (Kurose & Ross, 8th ed.), chapters 1–4. Every lab generates fresh numbers, checks answers and shows a worked solution.

Everything runs in the browser. Progress and ticked objectives are saved in `localStorage`, so they stay on the viewer's own device.

## Running locally

Requires [Bun](https://bun.sh) 1.3+.

```bash
bun install          # only needed for typechecking
bun run dev          # http://localhost:3000, hot reload
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
      m1/ … m4/        one folder per module
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

## Course book

Page and section numbers refer to the 8th edition. The PDF is used only as a local reference while writing content. It is git- and docker-ignored and must not be committed or served.
