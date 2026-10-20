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
  server.ts            Bun.serve: "/" (bundled page) and "/health"
  index.html           page shell
  client/
    main.js            builds tabs and panels, objective checkboxes
    styles.css
    widgets.js         interactive models (pipeline, DNS, cwnd, IPv4 header)
    lib/               helpers, drill engine, MCQ engine, progress store
    modules/           content per course module (m1–m4) and module index
```

Each module in `src/client/modules/` exports its drills (`gen()` returns a question, answer fields and a worked solution) and its concept-check questions. `modules/index.js` lists the modules with their objectives, reading and links.

## Course book

Page and section numbers refer to the 8th edition. The PDF is used only as a local reference while writing content. It is git- and docker-ignored and must not be committed or served.
