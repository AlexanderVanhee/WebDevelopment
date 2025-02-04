const setup = () => {
  let btnOptellen = document.getElementById("btnOptellen");
  let btnAftrekken = document.getElementById("btnAftrekken");
  let btnVermenigvuldigen = document.getElementById("btnVermenigvuldigen");
  let btnDelen = document.getElementById("btnDelen");

  btnOptellen.addEventListener("click", optellen);
  btnAftrekken.addEventListener("click", aftrekken);
  btnVermenigvuldigen.addEventListener("click", vermenigvuldigen);
  btnDelen.addEventListener("click", delen);
};

const berekening = (func, symbol) => {
  let txtOutput = document.getElementById("txtOutput");
  let txtLinks = document.getElementById("txtLinks");
  let txtRechts = document.getElementById("txtRechts");

  let g1 = parseInt(txtLinks.value, 10);
  let g2 = parseInt(txtRechts.value, 10);
  let resultaat = func(g1, g2);

  let resultaatTekst = g1 + " " + symbol + " " + g2 + "= " + resultaat;
  txtOutput.innerHTML = resultaatTekst;
};

const optellen = () => {
  berekening((v1, v2) => v1 + v2, "+");
};

const aftrekken = () => {
  berekening((v1, v2) => v1 - v2, "-");
};

const vermenigvuldigen = () => {
  berekening((v1, v2) => v1 * v2, "x");
};

const delen = () => {
  berekening((v1, v2) => v1 / v2, ":");
};

window.addEventListener("load", setup);
