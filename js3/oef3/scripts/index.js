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

    colorBox.style.backgroundColor = `rgb(${rgb.join(', ')})`;
  };

  // Add an update to the 3 sliders.
  sliders.forEach(({ slider }) => {
    slider.addEventListener("input", updateColor);
  });

  // Initialize with current values
  updateColor();
};

window.addEventListener("load", setup);