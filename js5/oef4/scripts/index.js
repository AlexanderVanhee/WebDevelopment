const setup = () => {
	document.getElementById('toonResultaat').addEventListener('click', () => {

		const isRoker = document.getElementById('roker').checked;
		let moedertaal = "";
		const moedertaalOpties = document.getElementsByName('moedertaal');
		for (let i = 0; i < moedertaalOpties.length; i++) {
			if (moedertaalOpties[i].checked) {
				moedertaal = moedertaalOpties[i].value;
				break;
			}
		}

		const buurland = document.getElementById('buurland').value;
		const bestellingSelect = document.getElementById('bestelling');
		const bestelling = Array.from(bestellingSelect.selectedOptions).map(option => option.value);

		console.log(isRoker ? 'is roker' : "is geen roker");
		console.log('Moedertaal is', moedertaal);
		console.log('Favoriete buurland is', buurland);
		console.log('Bestellingen bestaan uit ', bestelling.join(", "));
	});
}


window.addEventListener("load", setup);