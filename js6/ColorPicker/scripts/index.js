const global = {
  currentColor: "rgb(128, 128, 0128)"
};

const setColor = (color) => {
  const colorBox = document.getElementById("color-box");
  global.currentColor = color;
  colorBox.style.backgroundColor = global.currentColor;
}

const setup = () => {
  const sliders = ['red', 'green', 'blue'].map(color => ({
    slider: document.getElementById(`${color}-slider`),
    value: document.getElementById(`${color}-value`)
  }));



  const updateColor = () => {
    const rgb = sliders.map(({ slider, value }) => {
      const colorValue = slider.value;
      value.textContent = colorValue;
      return colorValue;
    });

    setColor(`rgb(${rgb.join(', ')})`);
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

  box.addEventListener("click", (event) => {
    setColor(event.target.style.backgroundColor);
  } )

  const button = document.createElement("button");

  const removeSwatch = (event) => {
    event.stopPropagation();
    event.target.parentElement.remove();

  };
  
  button.addEventListener("click", removeSwatch);
  button.classList.add("remove-button");
  button.textContent = "✖";

  box.appendChild(button);
  swatchBox.appendChild(box);
};


window.addEventListener("load", setup);
