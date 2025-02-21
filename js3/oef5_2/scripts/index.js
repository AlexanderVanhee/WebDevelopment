// Dynamische producten
const products = [
  {
    name: "product1",
    price: 10,
    vat: 0.06,
  },
  {
    name: "product2",
    price: 15,
    vat: 0.21,
  },
  {
    name: "product3",
    price: 12.2,
    vat: 0.21,
  },
];

const setup = () => {
  const table = document.querySelector("table");

  products.forEach((item) => {
    const row = document.createElement("tr");

    // producten
    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;
    row.appendChild(nameCell);

    // prijs
    const priceCell = document.createElement("td");
    priceCell.textContent = formatValuta(item.price);
    row.appendChild(priceCell);

    // input
    const amountCell = document.createElement("td");
    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.min = 0;
    amountInput.value = 0;

    amountCell.appendChild(amountInput);
    row.appendChild(amountCell);

    // btw
    const vatCell = document.createElement("td");
    vatCell.textContent = `${(item.vat * 100).toFixed(0)} %`;
    row.appendChild(vatCell);

    // subtotaal
    const subtotalCell = document.createElement("td");
    subtotalCell.textContent = formatValuta(0);
    row.appendChild(subtotalCell);

    table.appendChild(row);
  });

  const totalRow = document.createElement("tr");
  const totalLabelCell = document.createElement("td");
  totalLabelCell.textContent = "totaal";
  totalLabelCell.colSpan = 4;
  totalRow.appendChild(totalLabelCell);

  const totalAmountCell = document.createElement("td");
  totalAmountCell.textContent = formatValuta(0);
  totalAmountCell.id = "totalPrice";
  totalRow.appendChild(totalAmountCell);

  table.appendChild(totalRow);

  // Betere versie
  //amountInput.addEventListener("input", updateCalculations);

  document
    .getElementById("calculate")
    .addEventListener("click", updateCalculations);
};

const formatValuta = (value) => `${value.toFixed(2)} €`;

// Function to update subtotals and total price
const updateCalculations = () => {
  let totalSum = 0;
  const rows = document.querySelectorAll(
    "table tr:not(:first-child):not(:last-child)"
  );

  rows.forEach((row, index) => {
    const amount = parseInt(row.querySelector("input").value) || 0;
    const item = products[index];
    const subtotal = amount * item.price * (1 + item.vat);
    row.querySelector("td:last-child").textContent = formatValuta(subtotal);
    totalSum += subtotal;
  });

  document.getElementById("totalPrice").textContent = formatValuta(totalSum);
};

window.addEventListener("load", setup);
