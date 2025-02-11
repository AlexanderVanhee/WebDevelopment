const setup = () => {
  // deze code wordt pas uitgevoerd als de pagina volledig is ingeladen
};

const button = () => {
  let pElement = document.getElementById("txtOutput");
  pElement.innerHTML = "Welkom!";
};

window.addEventListener("load", setup);
