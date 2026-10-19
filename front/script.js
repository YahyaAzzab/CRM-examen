const formulaire = document.querySelector("#formulaire-client");

formulaire.addEventListener("submit", (event) => {
  event.preventDefault();
  formulaire.reset();
});
