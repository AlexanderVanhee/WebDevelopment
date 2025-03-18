const setup = () => {
	document.querySelectorAll("p").forEach(e => {
		e.textContent = "Good Job!";
	})
}

window.addEventListener("load", setup);