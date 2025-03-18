const setup = () => {
	document.querySelectorAll("li").forEach(e =>{
		e.classList = "listitem";
	});
	const body = document.querySelector("body");
	const img = document.createElement("img");
	img.setAttribute("src", "assets/banaan.jpg");
	img.setAttribute("alt","Mijn portret!");
	body.appendChild(img);
}

window.addEventListener("load", setup);