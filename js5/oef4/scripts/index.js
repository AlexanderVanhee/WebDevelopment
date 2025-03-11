const setup = () => {
	document.getElementById("children").addEventListener("input", function () {
		let value = this.value;
		
		if (!/^\d+$/.test(value)) {
			this.setCustomValidity("Voer alleen cijfers in.");
		} else if (value < 1 || value > 99) {
			this.setCustomValidity("Is te vruchtbaar");
		} else {
			this.setCustomValidity("");
		}
	});
}

window.addEventListener("load", setup);