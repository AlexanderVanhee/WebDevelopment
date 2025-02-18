const setup = () => {
  let buttons = document.getElementsByTagName("button");
  Array.prototype.forEach.call(buttons, (element) => {
    element.addEventListener("click", () => toggle(element));
  });
  console.log(buttons);
};

const toggle = (button) => button.classList.toggle("pressed");

window.addEventListener("load", setup);
