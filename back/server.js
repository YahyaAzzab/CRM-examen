const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { MongoClient } = require("mongodb");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const PORT = 3000;
const FRONT = path.join(__dirname, "..", "front");
const RACINE_FRONT = FRONT.endsWith(path.sep) ? FRONT : FRONT + path.sep;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Variable MONGODB_URI manquante. Copie back/.env.example vers back/.env");
  process.exit(1);
}

const client = new MongoClient(uri);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function envoyerJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function lireCorps(req) {
  return new Promise((resolve, reject) => {
    const morceaux = [];
    req.on("data", (morceau) => morceaux.push(morceau));
    req.on("end", () => {
      const texte = Buffer.concat(morceaux).toString();
      if (!texte) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(texte));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function servirFront(res, pathname) {
  const relatif = pathname === "/" ? "index.html" : pathname.slice(1);
  const fichier = path.normalize(path.join(FRONT, relatif));

  if (fichier !== FRONT && !fichier.startsWith(RACINE_FRONT)) {
    res.writeHead(403);
    res.end("Interdit");
    return;
  }

  try {
    const contenu = await fs.readFile(fichier);
    const type = TYPES[path.extname(fichier)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(contenu);
  } catch {
    res.writeHead(404);
    res.end("Introuvable");
  }
}

async function gererApi(req, res, pathname) {
  const collection = client.db("crm").collection("clients");

  if (req.method === "GET" && pathname === "/api/clients") {
    const clients = await collection.find().sort({ _id: -1 }).toArray();
    envoyerJson(res, 200, clients);
    return;
  }

  if (req.method === "POST" && pathname === "/api/clients") {
    const corps = await lireCorps(req);
    const nom = String(corps.nom || "").trim();
    const email = String(corps.email || "").trim();
    const entreprise = String(corps.entreprise || "").trim();

    if (!nom || !email || !entreprise) {
      envoyerJson(res, 400, { message: "Nom, email et entreprise sont obligatoires." });
      return;
    }

    const clientAjoute = { nom, email, entreprise };
    await collection.insertOne(clientAjoute);
    envoyerJson(res, 201, clientAjoute);
    return;
  }

  envoyerJson(res, 404, { message: "Route introuvable" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await gererApi(req, res, url.pathname);
      return;
    }
    await servirFront(res, url.pathname);
  } catch {
    envoyerJson(res, 500, { message: "Erreur serveur" });
  }
});

async function start() {
  await client.connect();
  console.log("Connecte a MongoDB");

  server.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Connexion MongoDB impossible:", error.message);
  process.exit(1);
});
