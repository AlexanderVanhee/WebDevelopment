const setup = () => {
  document
    .getElementById("calculate")
    .addEventListener("click", updateCalculations);
};

const formatValuta = (value) => `${value.toFixed(2).replace(".", ",")} €`;

const updateCalculations = () => {
  let totalSum = 0;

  document.querySelectorAll("table tr").forEach((row, index) => {
    if (index === 0 || row.cells.length < 5) return;

    const priceText = row.cells[1].textContent
      .replace(" €", "")
      .replace(",", ".");
    const price = parseFloat(priceText);
    const amount = parseInt(row.cells[2].querySelector("input").value) || 0;
    const vatText = row.cells[3].textContent.replace("%", "").trim();
    const vat = parseFloat(vatText) / 100;

    const subtotal = amount * price * (1 + vat);
    row.cells[4].textContent = formatValuta(subtotal);
    totalSum += subtotal;
  });

  document.getElementById("totalPrice").textContent = formatValuta(totalSum);
};

window.addEventListener("load", setup);
