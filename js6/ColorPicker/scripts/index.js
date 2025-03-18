const global = {
  currentColor: "rgb(128, 128, 0128)"
};

const setup = () => {
  const sliders = ['red', 'green', 'blue'].map(color => ({
    slider: document.getElementById(`${color}-slider`),
    value: document.getElementById(`${color}-value`)
  }));

  const colorBox = document.getElementById("color-box");

  const updateColor = () => {
    const rgb = sliders.map(({ slider, value }) => {
      const colorValue = slider.value;
      value.textContent = colorValue;
      return colorValue;
    });

    global.currentColor = `rgb(${rgb.join(', ')})`;
    colorBox.style.backgroundColor = global.currentColor;
  };

  sliders.forEach(({ slider }) => {
    slider.addEventListener("input", updateColor);
  });

  updateColor();
  document.querySelector("#save-button").addEventListener("click", addToSwatch);
};

const addToSwatch = () => {
  const swatchBox = document.querySelector("#swatch-box");

  const box = document.createElement("div");
  box.classList.add("swatch-item");
  box.style.backgroundColor = global.currentColor; 

  const button = document.createElement("button");

  const removeSwatch = (event) => {
    event.target.parentElement.remove();
  };
  
  button.addEventListener("click", removeSwatch);
  button.classList.add("remove-button");
  button.textContent = "✖";

  box.appendChild(button);
  swatchBox.appendChild(box);
};


window.addEventListener("load", setup);
