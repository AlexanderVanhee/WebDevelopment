const setup = () => {
  let buttons = Array.from(document.getElementsByTagName("button"));
  buttons.forEach((element) => {
    element.addEventListener("click", () => toggle(element));
  });
  console.log(buttons);
};

const toggle = (button) => button.classList.toggle("pressed");

window.addEventListener("load", setup);
