const setup = () => {
  const redSlider = document.getElementById("red-slider");
  const greenSlider = document.getElementById("green-slider");
  const blueSlider = document.getElementById("blue-slider");

  const redValue = document.getElementById("red-value");
  const greenValue = document.getElementById("green-value");
  const blueValue = document.getElementById("blue-value");

  const colorBox = document.getElementById("color-box");

  function updateColor() {
    const red = redSlider.value;
    const green = greenSlider.value;
    const blue = blueSlider.value;

    redValue.textContent = red;
    greenValue.textContent = green;
    blueValue.textContent = blue;

    colorBox.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
  }

  redSlider.addEventListener("input", updateColor);
  greenSlider.addEventListener("input", updateColor);
  blueSlider.addEventListener("input", updateColor);
  // fixes issue were color is wrong after reload
  updateColor();
};

window.addEventListener("load", setup);
