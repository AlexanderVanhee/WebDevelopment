const setup = () => {
	document.querySelector("button").addEventListener("click",appenddiv);
}

const appenddiv = () => {
	const p = document.createElement("p");
	p.textContent = "Hello!";
	document.querySelector("#myDIV").appendChild(p);
}

window.addEventListener("load", setup);