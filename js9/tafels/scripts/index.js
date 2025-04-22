const setup = () => {
    document.querySelector("#go-button").addEventListener("click", addTable);
}

const addTable = () => {
    const numberInput = document.querySelector("#number-input");
    const number = numberInput.value;

    if (isNaN(number)) {
        emptyForm();
        showError();
        return;
    }
    removeError();

    const outerDiv = document.createElement("div");
    outerDiv.classList.add("table");

    const header = document.createElement("div");
    header.textContent = `Tafel van ${number} gemaakt op: ${new Date().toLocaleTimeString()}`;
    outerDiv.appendChild(header);

    Array.from({ length: 10 }, (_, i) => i + 1).forEach(i => {
        const entry = document.createElement("div");
        entry.textContent = `${i} * ${number} = ${i * number}`;
        outerDiv.appendChild(entry);
    });

    document.querySelector("#tafels").appendChild(outerDiv);
    emptyForm();
}

const emptyForm = () => {
    document.querySelector("#number-input").value = '';
}

const showError = () => {
    document.querySelector("#error").classList.remove("hidden");
}

const removeError = () => {
    document.querySelector("#error").classList.add("hidden");
}

window.addEventListener("load", setup);
