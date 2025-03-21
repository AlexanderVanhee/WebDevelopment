const global = {
  currentColor: "rgb(128, 128, 128)"
};

const colors = ['red', 'green', 'blue'];
const updateSliders = (r, g, b) => {

  const values = [r, g, b];
  
  colors.forEach((color, index) => {
    const slider = document.getElementById(`${color}-slider`);
    const valueDisplay = document.getElementById(`${color}-value`);
    
    if (slider && valueDisplay) {
      slider.value = values[index];
      valueDisplay.textContent = values[index];
    }
  });
};

const parseRGB = (color) => {
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return rgbMatch ? [rgbMatch[1], rgbMatch[2], rgbMatch[3]] : null;
};

const setColor = (color) => {
  const colorBox = document.getElementById("color-box");
  global.currentColor = color;
  colorBox.style.backgroundColor = global.currentColor;
  
  const rgbValues = parseRGB(color);
  if (rgbValues) {
    updateSliders(...rgbValues);
  }
};

const setup = () => {
  const sliders = colors.map(color => ({
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
  });
  
  const button = document.createElement("button");
  button.classList.add("remove-button");
  button.textContent = "✖";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    event.target.parentElement.remove();
  });
  
  box.appendChild(button);
  swatchBox.appendChild(box);
};

window.addEventListener("load", setup);