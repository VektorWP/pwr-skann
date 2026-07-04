// Cloudflare Worker: CORS-прокси только для power.no
// Деплой: dash.cloudflare.com → Workers → Create → вставить этот код → Deploy
// В настройках PWR Skann указать: https://<имя>.workers.dev/?url={url}
export default {
  async fetch(request) {
    const target = new URL(request.url).searchParams.get("url");
    if (!target) return new Response("Missing ?url=", { status: 400 });
    let t;
    try { t = new URL(target); } catch { return new Response("Bad url", { status: 400 }); }
    // Только power.no — чтобы прокси не стал открытым
    if (!/(^|\.)power\.no$/.test(t.hostname)) {
      return new Response("Host not allowed", { status: 403 });
    }
    const upstream = await fetch(t.href, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    });
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60"
      }
    });
  }
};
