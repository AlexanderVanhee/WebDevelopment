const setup = () => {
  document
    .getElementById("startButton")
    .addEventListener("click", addGemeentes);
};

const addGemeentes = () => {
  const dropdown = document.getElementById("gemeente");
  let array = [];
  let keepGoing = true;
  while (keepGoing) {
    let gemeente = prompt("Voeg een gemeente toe");
    if (gemeente && gemeente !== "stop") {
        array.push(gemeente);
    } else {
      keepGoing = false;
    }
  }
  array.sort().reverse();
  array.forEach((gemeente) => {
    let option = document.createElement("option");
    option.text = option.value = gemeente;
    dropdown.add(option, 0);
  })
};

window.addEventListener("load", setup);
