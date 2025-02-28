const setup = () => {
  // Doing [...collection] is the simplest way to turn a collection into an array.
  // the "..."" are known as a spread operator.
  [...document.getElementsByTagName("button")].forEach(button => {
    button.addEventListener("click", () => button.classList.toggle("pressed"));
  });
};

window.addEventListener("load", setup);