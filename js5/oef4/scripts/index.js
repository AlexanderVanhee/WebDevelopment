const setup = () => {
	document.getElementById("children").addEventListener("input", (event) => {
		let value = event.target.value;
		
		if (!/^\d+$/.test(value)) {
			event.target.setCustomValidity("Voer alleen cijfers in.");
		} else if (value < 1 || value > 99) {
			event.target.setCustomValidity("Is te vruchtbaar");
		} else {
			event.target.setCustomValidity("");
		}
	});
};

window.addEventListener("load", setup);