const setup = () => {
  let text = "De man van An geeft geen hand aan ambetante verwanten";
  let searchTerm = "an";
  let count = 0;
  let position = text.indexOf(searchTerm);

  //IndexOf
  while (position !== -1) {
    count++;
    position = text.indexOf(searchTerm, position + 1);
  }

  console.log(`Het aantal keer dat "an" voorkomt (met indexOf): ${count}`);

  const resultIndexOf = document.createElement("p");
  resultIndexOf.textContent = `Het aantal keer dat "an" voorkomt (met indexOf): ${count}`;
  document.body.appendChild(resultIndexOf);

  let count2 = 0;
  let position2 = text.lastIndexOf(searchTerm);

  //lastIndexOf
  while (position2 !== -1) {
    count2++;
    position2 = text.lastIndexOf(searchTerm, position2 - 1);
  }

  console.log(`Het aantal keer dat "an" voorkomt (met lastIndexOf): ${count2}`);

  const resultLastIndexOf = document.createElement("p");
  resultLastIndexOf.textContent = `Het aantal keer dat "an" voorkomt (met lastIndexOf): ${count2}`;
  document.body.appendChild(resultLastIndexOf);
};

window.addEventListener("load", setup);
