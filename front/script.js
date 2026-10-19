const formulaire = document.querySelector("#formulaire-client");
const liste = document.querySelector("#liste-clients");

function echapper(texte) {
  return String(texte)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function afficherClients(clients) {
  if (clients.length === 0) {
    liste.innerHTML = '<tr><td colspan="3">Aucun client pour le moment.</td></tr>';
    return;
  }

  liste.innerHTML = clients
    .map(
      (client) => `
        <tr>
          <td>${echapper(client.nom)}</td>
          <td>${echapper(client.email)}</td>
          <td>${echapper(client.entreprise)}</td>
        </tr>
      `
    )
    .join("");
}

async function chargerClients() {
  const reponse = await fetch("/api/clients");
  if (!reponse.ok) {
    liste.innerHTML = '<tr><td colspan="3">Impossible de charger les clients.</td></tr>';
    return;
  }
  afficherClients(await reponse.json());
}

formulaire.addEventListener("submit", async (event) => {
  event.preventDefault();
  const donnees = Object.fromEntries(new FormData(formulaire));

  const reponse = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donnees),
  });

  if (!reponse.ok) {
    return;
  }

  formulaire.reset();
  await chargerClients();
});

chargerClients();
