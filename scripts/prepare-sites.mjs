import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const projectId = "appgprj_6a68d22ab9148191a918e41fd7d19e3c";
const distRoot = resolve("dist");
const textExtensions = new Set([".css", ".html", ".js", ".svg", ".txt"]);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
};

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });

async function collectFiles(directory) {
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = resolve(directory, entry.name);
    const relativePath = relative(distRoot, fullPath).replaceAll("\\", "/");
    if (relativePath.startsWith("server/") || relativePath.startsWith(".openai/")) continue;
    if (entry.isDirectory()) {
      Object.assign(files, await collectFiles(fullPath));
      continue;
    }
    const extension = extname(entry.name).toLowerCase();
    const bytes = await readFile(fullPath);
    const isText = textExtensions.has(extension);
    files[`/${relativePath}`] = {
      body: isText ? bytes.toString("utf8") : bytes.toString("base64"),
      encoding: isText ? "text" : "base64",
      type: mimeTypes[extension] || "application/octet-stream",
    };
  }
  return files;
}

const assets = await collectFiles(distRoot);
const worker = `const assets = ${JSON.stringify(assets)};
const FIELD_TEST_MARKER = "<!-- fieseya:field-test-without-qr=off -->";
const stripFieldTestMarker = value => String(value || "").replace(/\\s*<!-- fieseya:field-test-without-qr=off -->\\s*$/, "").trim();
const hasFieldTestMarker = value => String(value || "").includes(FIELD_TEST_MARKER);

const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function supabase(requestPath, env, init = {}) {
  const key = env.VITE_SUPABASE_ANON_KEY;
  const headers = new Headers(init.headers || {});
  headers.set("apikey", key);
  headers.set("authorization", \`Bearer \${key}\`);
  return fetch(\`\${env.VITE_SUPABASE_URL}\${requestPath}\`, { ...init, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/admin/verify" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return body.pin && body.pin === env.VITE_ADMIN_PIN
        ? new Response(null, { status: 204 })
        : json({ error: "Napačen administratorski PIN." }, 401);
    }

    if (url.pathname === "/api/hints" && request.method === "GET") {
      const response = await supabase("/rest/v1/stations?select=id,main_hint,extra_hint&order=id", env);
      if (!response.ok) return json({ error: "Namigov ni bilo mogoče naložiti." }, 502);
      const rows = await response.json();
      return json(rows.map(row => ({ ...row, extra_hint: stripFieldTestMarker(row.extra_hint) })));
    }

    if (url.pathname === "/api/settings" && request.method === "GET") {
      const response = await supabase("/rest/v1/stations?id=eq.1&select=extra_hint", env);
      if (!response.ok) return json({ error: "Nastavitve ni bilo mogoče naložiti." }, 502);
      const [station] = await response.json();
      return json({ field_test_without_qr_enabled: !hasFieldTestMarker(station?.extra_hint) });
    }

    if (url.pathname === "/api/settings" && request.method === "PUT") {
      const body = await request.json().catch(() => ({}));
      if (!body.pin || body.pin !== env.VITE_ADMIN_PIN) return json({ error: "Napačen administratorski PIN." }, 401);
      if (typeof body.field_test_without_qr_enabled !== "boolean") return json({ error: "Neveljavna nastavitev." }, 400);
      const currentResponse = await supabase("/rest/v1/stations?id=eq.1&select=main_hint,extra_hint", env);
      if (!currentResponse.ok) return json({ error: "Nastavitve ni bilo mogoče naložiti." }, 502);
      const [station] = await currentResponse.json();
      if (!station) return json({ error: "Postaja 1 ni bila najdena." }, 502);
      const cleanExtraHint = stripFieldTestMarker(station.extra_hint);
      const extraHint = body.field_test_without_qr_enabled
        ? cleanExtraHint
        : \`\${cleanExtraHint}\\n\${FIELD_TEST_MARKER}\`;
      const response = await supabase("/rest/v1/rpc/admin_update_station_hints", env, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          p_secret: env.HINTS_API_SECRET,
          p_station_id: 1,
          p_main_hint: station.main_hint,
          p_extra_hint: extraHint,
        }),
      });
      if (!response.ok) return json({ error: "Baza spremembe ni sprejela." }, 502);
      return json({ ok: true, field_test_without_qr_enabled: body.field_test_without_qr_enabled });
    }

    const match = url.pathname.match(/^\\/api\\/hints\\/(\\d+)$/);
    if (match && request.method === "PUT") {
      const body = await request.json().catch(() => ({}));
      if (!body.pin || body.pin !== env.VITE_ADMIN_PIN) return json({ error: "Napačen administratorski PIN." }, 401);
      const stationId = Number(match[1]);
      if (stationId < 1 || stationId > 7 || !body.main_hint?.trim() || !body.extra_hint?.trim()) {
        return json({ error: "Oba namiga sta obvezna." }, 400);
      }
      let extraHint = body.extra_hint.trim();
      if (stationId === 1) {
        const currentResponse = await supabase("/rest/v1/stations?id=eq.1&select=extra_hint", env);
        if (!currentResponse.ok) return json({ error: "Nastavitve ni bilo mogoče ohraniti." }, 502);
        const [station] = await currentResponse.json();
        if (hasFieldTestMarker(station?.extra_hint)) extraHint = \`\${extraHint}\\n\${FIELD_TEST_MARKER}\`;
      }
      const response = await supabase("/rest/v1/rpc/admin_update_station_hints", env, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          p_secret: env.HINTS_API_SECRET,
          p_station_id: stationId,
          p_main_hint: body.main_hint.trim(),
          p_extra_hint: extraHint,
        }),
      });
      if (!response.ok) return json({ error: "Baza spremembe ni sprejela." }, 502);
      return json({ ok: true });
    }

    const path = url.pathname;
    const asset = assets[path] || assets["/index.html"];
    const responseBody = asset.encoding === "base64"
      ? Uint8Array.from(atob(asset.body), character => character.charCodeAt(0))
      : asset.body;
    return new Response(responseBody, {
      headers: {
        "content-type": asset.type,
        "cache-control": path.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      },
    });
  },
};
`;

await writeFile("dist/server/index.js", worker);
await writeFile("dist/.openai/hosting.json", `${JSON.stringify({ project_id: projectId }, null, 2)}\n`);
