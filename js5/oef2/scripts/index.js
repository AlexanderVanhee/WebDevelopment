const setup = () => {
  let tekst = "Gisteren zat de jongen op de stoep en at de helft van de appel";
  console.log(deNaarHet(tekst));
  document.getElementById("text").textContent = deNaarHet(tekst);
};

const capitalizeFirstLetter = (val) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

const deNaarHet = (input) => {
  const critera = "de";
  const replacement = "het";
  const firstCriteria = critera.slice(0, 1);
  let string = input;
  for (i = 0; i < string.length - 1; i++) {
    if (string.slice(i, i + 2).toLowerCase() === critera) {
      let replacementValue =
        string.slice(i, i + 1) === firstCriteria.toLowerCase()
          ? replacement
          : capitalizeFirstLetter(replacement);
      // Keep capitalization
      string =
        string.slice(0, i) +
        replacementValue +
        string.slice(i + 2, string.length);
      i += replacementValue.length;
    }
  }
  return string;
};

window.addEventListener("load", setup);
