const setup = () => {
  document
    .getElementById("startButton")
    .addEventListener("click", addGemeentes);
};

const addGemeentes = () => {
  const dropdown = document.getElementById("gemeente");
  let keepGoing = true;
  while (keepGoing) {
    let gemeente = prompt("Voeg een gemeente toe");
    if (gemeente && gemeente !== "stop") {
      var option = document.createElement("option");
      option.text = option.value = gemeente;
      dropdown.add(option, 0);
    } else {
      keepGoing = false;
    }
  }
};

window.addEventListener("load", setup);
