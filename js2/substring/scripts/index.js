const setup = () => {
  // deze code wordt pas uitgevoerd als de pagina volledig is ingeladen
  document.getElementById("calculate").addEventListener("click", calculate);
};

const calculate = () => {
  const input = document.getElementById("input").value;
  const arg1 = document.getElementById("arg1").value;
  const arg2 = document.getElementById("arg2").value;
  let output = document.getElementById("output");

  if (arg1 === "" || arg2 === "" || input === "") {
    output.textContent = "Enter both function arguments";
    return;
  }

  const calculation = input.substring(arg1, arg2);
  output.textContent = calculation;
};


window.addEventListener("load", setup);
