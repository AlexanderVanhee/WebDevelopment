const setup = () => {
  // deze code wordt pas uitgevoerd als de pagina volledig is ingeladen
  document.getElementById("alert").addEventListener("click", alert);
  document.getElementById("confirm").addEventListener("click", confirm);
  document.getElementById("prompt").addEventListener("click", prompt);
};

window.addEventListener("load", setup);

const alert = () => {
  let answer = window.alert("Dit is een mededeling");
  console.log("alert: " + answer);
};

const confirm = () => {
  let confirm = window.confirm("Weet u het zeker?");
  console.log("confirm: " + confirm);
};

const prompt = () => {
  let prompt = window.prompt("Wat is uw naam", "onbekend");
  console.log("prompt: " + prompt);
};
