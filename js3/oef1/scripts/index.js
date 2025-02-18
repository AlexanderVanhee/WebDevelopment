const setup = () => {
  let opvallends = document.getElementsByClassName("belangrijk");
  console.log(opvallends.length);
  for (let i = 0; i < opvallends.length; i++) {
    opvallends[i].classList.add("opvallend");
  }
};

window.addEventListener("load", setup);
