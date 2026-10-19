const path = require("path");
const express = require("express");
const { MongoClient } = require("mongodb");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const PORT = 3000;
const FRONT = path.join(__dirname, "..", "front");
const app = express();

let connexion;

function obtenirClient() {
  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error("MONGODB_URI manquante"));
  }

  if (!connexion) {
    const mongo = new MongoClient(process.env.MONGODB_URI);
    connexion = mongo.connect();
  }

  return connexion;
}

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from le front, Yahya Azzab");
});

app.get("/login", (req, res) => {
  res.send("Bienvenue sur la route login.");
});

app.get("/sign-up", (req, res) => {
  res.send("Bienvenue sur la route sign up.");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Connexion Front-Back réussie" });
});

app.get("/api/clients", async (req, res) => {
  try {
    const mongo = await obtenirClient();
    const clients = await mongo.db("crm").collection("clients").find().sort({ _id: -1 }).toArray();
    res.json(clients);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/clients", async (req, res) => {
  try {
    const nom = String(req.body.nom || "").trim();
    const email = String(req.body.email || "").trim();
    const entreprise = String(req.body.entreprise || "").trim();

    if (!nom || !email || !entreprise) {
      res.status(400).json({ message: "Nom, email et entreprise sont obligatoires." });
      return;
    }

    const mongo = await obtenirClient();
    const clientAjoute = { nom, email, entreprise };
    await mongo.db("crm").collection("clients").insertOne(clientAjoute);
    res.status(201).json(clientAjoute);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/crm", (req, res) => {
  res.sendFile(path.join(FRONT, "index.html"));
});

app.use(express.static(FRONT));

module.exports = app;

if (!process.env.VERCEL) {
  obtenirClient()
    .then(() => {
      console.log("Connecte a MongoDB");
      app.listen(PORT, () => {
        console.log(`Serveur demarre sur http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Connexion MongoDB impossible:", error.message);
      process.exit(1);
    });
}
