class StorageUtil { // Abstractie van localStorage voor objecten.
  static get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static has(key) {
    return localStorage.getItem(key) !== null;
  }
}

// Heb beslist om de code te refactoren naar een klasse, voor een eenvoudigere state management.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
class ColorPicker {
  constructor() {
    this.state = {
      currentColor: '',
      colors: ['red', 'green', 'blue']
    };

    this.storage = {
      swatchesKey: 'colorPicker.colors',
      currentColorKey: 'colorPicker.sliderValues'
    };

    this.elements = {};
    this.init();
  }

  init() {
    this.initElements();
    this.loadSavedColor();
    this.loadSavedSwatches();
    this.setupEventListeners();
    this.updateColorFromSliders();
  }

  initElements() {
    this.elements.colorBox = document.querySelector('#color-box');
    this.elements.swatchBox = document.querySelector('#swatch-box');
    this.elements.saveButton = document.querySelector('#save-button');
    this.elements.hexDisplay = document.querySelector('#hexDisplay');

    this.elements.sliders = this.state.colors.map(color => ({
      color,
      slider: document.querySelector(`#${color}-slider`),
      value: document.querySelector(`#${color}-value`)
    }));
  }


  setupEventListeners() {
    // Sliders
    this.elements.sliders.forEach(({ slider }) => {
      slider.addEventListener('input', () => this.updateColorFromSliders());
    });
    // Add button for the swatches
    this.elements.saveButton.addEventListener('click', () => this.saveCurrentColor());
    // Add copy to clipboard
    this.elements.colorBox.addEventListener('click', () => this.copyColorToClipboard());
  }

  setColor(color) {
    this.state.currentColor = color;
    this.elements.colorBox.style.backgroundColor = color;
    this.elements.hexDisplay.textContent = ColorPicker.rgbToHex(color);

    const rgbValues = ColorPicker.parseRGB(color);
    if (rgbValues) {
      this.updateSliders(...rgbValues);
    }

    StorageUtil.set(this.storage.currentColorKey, color);
  }

  updateColorFromSliders() {
    const rgbValues = this.elements.sliders.map(({ slider, value }) => {
      const colorValue = slider.value;
      value.textContent = colorValue;
      return colorValue;
    });

    const color = `rgb(${rgbValues.join(', ')})`;
    this.setColor(color);
  }

  updateSliders(r, g, b) {
    const values = [r, g, b];
    this.elements.sliders.forEach(({ slider, value }, index) => {
      if (slider && value) {
        slider.value = values[index];
        value.textContent = values[index];
      }
    });
  }

  static parseRGB(color) {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return rgbMatch ? [rgbMatch[1], rgbMatch[2], rgbMatch[3]] : null;
  }

  saveCurrentColor() {
    this.addToSwatches(this.state.currentColor);
    this.addSwatchToStorage(this.state.currentColor);
  }

  addToSwatches(color) {
    const swatchItem = document.createElement('div');
    swatchItem.classList.add('swatch-item');
    swatchItem.style.backgroundColor = color;
    swatchItem.addEventListener('click', () => this.setColor(color));

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-button');
    removeButton.textContent = '✖';
    removeButton.addEventListener('click', (event) => this.removeSwatch(event));

    swatchItem.appendChild(removeButton);
    this.elements.swatchBox.appendChild(swatchItem);
  }

  removeSwatch(event) {
    event.stopPropagation();
    const swatchItem = event.target.parentElement;
    const index = ColorPicker.getNodeIndex(swatchItem);

    this.removeSwatchFromStorage(index);
    swatchItem.remove();
  }

  static getNodeIndex(element) {
    return Array.from(element.parentNode.childNodes).indexOf(element);
  }

  loadSavedColor() {
    const savedColor = StorageUtil.get(this.storage.currentColorKey);
    if (savedColor) {
      this.setColor(savedColor);
    } else {
      this.setColor('rgb(0, 0, 0)');
    }
  }

  copyColorToClipboard() {
    const hexColor = ColorPicker.rgbToHex(this.state.currentColor);

    navigator.clipboard.writeText(hexColor)
      .then(() => {
        this.elements.hexDisplay.textContent = "Copied!";
        setTimeout(() => {
          this.elements.hexDisplay.textContent = hexColor;
        }, 1500);
      })
      .catch(err => {
        console.error("Failed to copy color:", err);
        this.elements.hexDisplay.textContent = "Copy failed!";
        setTimeout(() => {
          this.elements.hexDisplay.textContent = hexColor;
        }, 1500);
      });
  }
  

  static rgbToHex(rgbString) {
    const result = rgbString.match(/\d+/g).map(Number);
    return "#" + result.map(x => x.toString(16).padStart(2, '0')).join('');
  }
  

  loadSavedSwatches() {
    const swatches = StorageUtil.get(this.storage.swatchesKey) || [];
    swatches.forEach(color => this.addToSwatches(color));
  }

  addSwatchToStorage(color) {
    const colors = StorageUtil.get(this.storage.swatchesKey) || [];
    colors.push(color);
    StorageUtil.set(this.storage.swatchesKey, colors);
  }

  removeSwatchFromStorage(index) {
    const colors = StorageUtil.get(this.storage.swatchesKey) || [];
    colors.splice(index, 1);
    StorageUtil.set(this.storage.swatchesKey, colors);
  }
}

window.addEventListener('load', () => new ColorPicker());
