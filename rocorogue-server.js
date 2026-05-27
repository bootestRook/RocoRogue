const fs = require("fs");
const http = require("http");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(process.argv[2] || process.cwd());
const port = Number(process.argv[3] || 4173);
const host = "127.0.0.1";
const uiTunerEnabled = process.env.ROCO_UI_TUNER === "1" || process.env.VITE_ROCO_UI_TUNER === "1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function insideRoot(filePath) {
  const resolved = path.resolve(filePath);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  const lowerResolved = resolved.toLowerCase();
  const lowerRoot = root.toLowerCase();
  const lowerRootWithSep = rootWithSep.toLowerCase();
  return lowerResolved === lowerRoot || lowerResolved.startsWith(lowerRootWithSep);
}

function candidatesFor(urlPathname) {
  const pathname = urlPathname === "/" ? "/index.html" : urlPathname;
  const rawRelative = pathname.replace(/^\/+/, "");
  const candidates = [rawRelative];

  try {
    const decoded = decodeURIComponent(rawRelative);
    if (decoded !== rawRelative) candidates.unshift(decoded);
  } catch {}

  return candidates.map((relativePath) => path.join(root, relativePath));
}

function sendError(res, statusCode) {
  res.writeHead(statusCode, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(http.STATUS_CODES[statusCode] || "Error");
}

function projectRoot() {
  return path.basename(root).toLowerCase() === "rocorogue-public"
    ? path.dirname(root)
    : root;
}

function gitValue(args) {
  try {
    return execFileSync("git", args, {
      cwd: projectRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim() || null;
  } catch {
    return null;
  }
}

const uiTunerBase = uiTunerEnabled
  ? {
      gitCommit: gitValue(["rev-parse", "HEAD"]),
      branch: gitValue(["rev-parse", "--abbrev-ref", "HEAD"]),
    }
  : { gitCommit: null, branch: null };

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req, maxBytes, onData) {
  let body = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > maxBytes) req.destroy();
  });
  req.on("end", () => {
    try {
      onData(JSON.parse(body));
    } catch {
      onData(null);
    }
  });
}

function injectUiTuner(html) {
  if (!uiTunerEnabled) return html;

  const payload = JSON.stringify({
    enabled: true,
    app: "RocoRogue",
    port,
    saveEndpoint: "/__ui_tuner/save",
    base: uiTunerBase,
  }).replace(/</g, "\\u003c");

  const injection = [
    `<script>window.__ROCO_UI_TUNER__=${payload};</script>`,
    `<link rel="stylesheet" href="/assets/ui-tuner/ui-tuner.css?v=20260527-1">`,
    `<script type="module" src="/assets/ui-tuner/ui-tuner.js?v=20260527-1"></script>`,
  ].join("\n");

  return html.includes("</body>")
    ? html.replace("</body>", `${injection}\n</body>`)
    : `${html}\n${injection}`;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${host}:${port}`);

  if (uiTunerEnabled && req.method === "GET" && requestUrl.pathname === "/__ui_tuner/health") {
    sendJson(res, 200, {
      ok: true,
      mode: "ui-tuner",
      app: "RocoRogue",
      base: uiTunerBase,
    });
    return;
  }

  if (uiTunerEnabled && req.method === "POST" && requestUrl.pathname === "/__ui_tuner/save") {
    readJsonBody(req, 2 * 1024 * 1024, (data) => {
      if (!data || data.version !== 1 || data.app !== "RocoRogue" || data.mode !== "ui-tuner" || typeof data.items !== "object") {
        sendError(res, 400);
        return;
      }

      try {
        const outputDir = path.join(projectRoot(), "ui-tuning");
        const outputPath = path.join(outputDir, "latest.layout.json");
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf8");
        sendJson(res, 200, { ok: true, path: outputPath });
      } catch (error) {
        sendJson(res, 500, { ok: false, error: error.message });
      }
    });
    return;
  }

  if (req.method === "POST" && req.url && requestUrl.pathname === "/__roco_switch_tuning") {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 128 * 1024) req.destroy();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (!data || data.name !== "roco-switch-card-tuning" || typeof data.values !== "object") {
          sendError(res, 400);
          return;
        }

        const projectRoot = path.basename(root).toLowerCase() === "rocorogue-public"
          ? path.dirname(root)
          : root;
        const outputPath = path.join(projectRoot, "switch-card-tuning.json");
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf8");
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        });
        res.end(JSON.stringify({ ok: true, path: outputPath }));
      } catch {
        sendError(res, 400);
      }
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendError(res, 405);
    return;
  }

  const filePath = candidatesFor(requestUrl.pathname).find((candidate) => {
    if (!insideRoot(candidate)) return false;
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });

  if (!filePath) {
    sendError(res, 404);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "content-type": mimeTypes[ext] || "application/octet-stream",
    "cache-control": "no-store",
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  if (uiTunerEnabled && ext === ".html" && path.basename(filePath).toLowerCase() === "index.html") {
    res.end(injectUiTuner(fs.readFileSync(filePath, "utf8")));
    return;
  }

  fs.createReadStream(filePath).pipe(res);
});

server.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}/`);
});
