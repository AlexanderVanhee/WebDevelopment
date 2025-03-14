const setup = () => {
  document
    .getElementById("startButton")
    .addEventListener("click", addMunicipalities);
};

const addMunicipalities = () => {
  const dropdown = document.getElementById("gemeente");
  const municipalities = collectMunicipalities();

  municipalities.sort().reverse();

  municipalities.forEach((municipality) => {
    const option = document.createElement("option");
    option.text = municipality;
    option.value = municipality;
    dropdown.add(option, 0);
  });
};

const collectMunicipalities = () => {
  const municipalities = [];
  let keepCollecting = true;

  while (keepCollecting) {
    const input = prompt("Voeg een gemeente toe");

    if (input && input !== "stop") {
      municipalities.push(input);
    } else {
      keepCollecting = false;
    }
  }

  return municipalities;
};

window.addEventListener("load", setup);