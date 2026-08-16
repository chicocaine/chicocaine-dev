import streakApi from "../src/scripts/streak";

export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/streak") {
      return streakApi.fetch(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }
		return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
