const global = {
  currentColor: '',
  localStorageKey: 'colorPicker.colors',
  sliderLocalStorageKey: 'colorPicker.sliderValues'
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
  const storedColor = loadSlidersFromLocalStorage();
  if (storedColor) {
    setColor(storedColor);
  }


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
    var color = `rgb(${rgb.join(', ')})`
    setColor(color);
    saveSliderToLocalStorage(color);

  };
  
  sliders.forEach(({ slider }) => {
    slider.addEventListener("input", updateColor);
  });

  updateColor();
  

  document.querySelector("#save-button").addEventListener("click", () => {
    addToSwatch( global.currentColor);
    addToLocalStorage(global.currentColor);
  });
  var colorList = loadLocalStorage(global.localStorageKey);
  colorList.forEach((color) => addToSwatch(color) );
  
};

const addToSwatch = (newColor) => {
  const swatchBox = document.querySelector("#swatch-box");
  const box = document.createElement("div");
  box.classList.add("swatch-item");
  box.style.backgroundColor = newColor;
  box.addEventListener("click", (event) => {
    setColor(event.target.style.backgroundColor);
  });
  
  const button = document.createElement("button");
  button.classList.add("remove-button");
  button.textContent = "✖";

  button.addEventListener("click", (event) => deleteButton(event));
  
  box.appendChild(button);
  swatchBox.appendChild(box);
};


const deleteButton = (event) => {
  console.log("deleting");
  event.stopPropagation();
  removeFromLocalStorage(getNodeIndex(event.target.parentElement));
  event.target.parentElement.remove();
}

const getNodeIndex = (element) => {
  return Array.from(element.parentNode.childNodes).indexOf(element);
}

const loadLocalStorage = (key) =>{
  const jsonData = localStorage.getItem(key);
  var value;
  if (jsonData != null){
    return JSON.parse(jsonData);
  }
  return value;
}

const addToLocalStorage = (color) => {
  var colorList = loadLocalStorage(global.localStorageKey);
  colorList.push(color);
  localStorage.setItem(global.localStorageKey, JSON.stringify(colorList));
}

const removeFromLocalStorage = (index) => {
  console.log(index);
  var colorList = loadLocalStorage(global.localStorageKey);
  colorList.splice(index,1);
  localStorage.setItem(global.localStorageKey, JSON.stringify(colorList));
}

const loadSlidersFromLocalStorage =() => {
  const sliders = loadLocalStorage(global.sliderLocalStorageKey);
  if (sliders != null){
    console.log("Loading", sliders);
    return sliders;
  }
  console.log("returning default value");
  return JSON.parse(sliders);
} 

const saveSliderToLocalStorage = (color) => {
  
  localStorage.setItem(global.sliderLocalStorageKey,JSON.stringify(color));
}

window.addEventListener("load", setup);