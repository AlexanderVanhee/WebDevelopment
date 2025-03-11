const setup = () => {
  const body = document.body;
  createTriagram("onoorbaar").forEach((entry) => {
    let para = document.createElement("p");
    let node = document.createTextNode(entry);
    para.appendChild(node);
    body.appendChild(para);
  });
};

const createTriagram = (input) => {
  let list = [];
  for (let i = 0; i < input.length - 2; i++) {
    list.push(input.substring(i, i + 3));
  }
  return list;
};

window.addEventListener("load", setup);
