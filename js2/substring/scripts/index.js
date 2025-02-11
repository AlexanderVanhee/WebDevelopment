const setup = () => {
  // deze code wordt pas uitgevoerd als de pagina volledig is ingeladen
  let btnKopieer = document.getElementById("btnKopieer");
  btnKopieer.addEventListener("click", kopieer);
};

const calculate = () => {
  const input = document.getElementById("input").value;
  const arg1 = document.getElementById("arg1").value;
  const arg2 = document.getElementById("arg2").value;
  let output = document.getElementById("output");
  const calculation = input.substring(arg1, arg2);

  console.log(calculation);
  document.getElementById("output").textContent = calculation;
};

window.addEventListener("load", setup);
