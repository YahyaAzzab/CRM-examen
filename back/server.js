const http = require("http");
const path = require("path");
const { MongoClient } = require("mongodb");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const PORT = 3000;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Variable MONGODB_URI manquante. Copie back/.env.example vers back/.env");
  process.exit(1);
}

const client = new MongoClient(uri);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Serveur CRM demarre" }));
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
