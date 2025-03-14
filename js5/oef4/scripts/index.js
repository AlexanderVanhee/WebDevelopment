const setup = () => {
	document.getElementById('toonResultaat').addEventListener('click', () => {

		const isRoker = document.getElementById('roker').checked;
		let moedertaal = "";
		const moedertaalOpties = document.getElementsByName('moedertaal');
		const selectedOptie = Array.from(moedertaalOpties).find(optie => optie.checked);
		moedertaal = selectedOptie ? selectedOptie.value : undefined;
		const buurland = document.getElementById('buurland').value;

		const bestellingSelect = document.getElementById('bestelling');
		const bestelling = Array.from(bestellingSelect.selectedOptions).map(option => option.value);

		console.log(isRoker ? 'is roker' : "is geen roker");
		console.log('Moedertaal is', moedertaal);
		console.log('Favoriete buurland is', buurland);

		if (bestelling.length > 0) {
			console.log('Bestellingen bestaan uit ', bestelling.join(", "));
		} else {
			console.log('Geen bestellingen gevonden.');
		}

	});
}


window.addEventListener("load", setup);