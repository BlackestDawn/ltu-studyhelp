import homepage from "./index.html";

const port = Number(process.env.PORT ?? 3000);
const development = process.env.NODE_ENV !== "production";

const server = Bun.serve({
  port,
  development,
  routes: {
    "/": homepage,
    "/health": new Response("ok"),
  },
  fetch() {
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);
