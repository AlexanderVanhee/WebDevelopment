document.addEventListener('DOMContentLoaded', () => {
	const valideerBtn = document.getElementById('valideerBtn');
	valideerBtn.addEventListener('click', valideerFormulier);
});

const showError = (element, bericht) => {
	element.classList.add('invalid');
	document.getElementById(`${element.id}-error`).textContent = bericht;
};

const resetValidatie = () => {
	const inputs = document.querySelectorAll('input');
	inputs.forEach(input => {
		input.classList.remove('invalid');
		document.getElementById(`${input.id}-error`).textContent = '';
	});
};

const valideerVoornaam = () => {
	const voornaam = document.getElementById('voornaam');
	if (voornaam.value.length > 30) {
		showError(voornaam, 'max. 30 karakters');
		return false;
	}
	return true;
};

const valideerFamilienaam = () => {
	const familienaam = document.getElementById('familienaam');
	if (familienaam.value.length === 0) {
		showError(familienaam, 'verplicht veld');
		return false;
	}
	if (familienaam.value.length > 50) {
		showError(familienaam, 'max 50 karakters');
		return false;
	}
	return true;
};

const valideerGeboortedatum = () => {
	const geboortedatum = document.getElementById('geboortedatum');
	if (geboortedatum.value.length === 0) {
		showError(geboortedatum, 'verplicht veld');
		return false;
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(geboortedatum.value)) {
		showError(geboortedatum, 'formaat is niet jjjj-mm-dd');
		return false;
	}
	return true;
};

const valideerEmail = () => {
	const email = document.getElementById('email');
	if (email.value.length === 0) {
		showError(email, 'verplicht veld');
		return false;
	}

	const atCount = (email.value.match(/@/g) || []).length;
	const parts = email.value.split('@');
	if (atCount !== 1 || parts[0].length === 0 || parts[1].length === 0) {
		showError(email, 'geen geldig email adres');
		return false;
	}

	return true;
};

const valideerKinderen = () => {
	const kinderen = document.getElementById('kinderen');
	const kinderenValue = parseInt(kinderen.value);
	if (isNaN(kinderenValue) || kinderenValue < 0) {
		showError(kinderen, 'is geen positief getal');
		return false;
	}
	if (kinderenValue >= 99) {
		showError(kinderen, 'is te vruchtbaar');
		return false;
	}
	return true;
};

const valideerFormulier = () => {
	resetValidatie();

	const voornaamValid = valideerVoornaam();
	const familienaamValid = valideerFamilienaam();
	const geboortedatumValid = valideerGeboortedatum();
	const emailValid = valideerEmail();
	const kinderenValid = valideerKinderen();

	if (voornaamValid && familienaamValid && geboortedatumValid && emailValid && kinderenValid) {
		alert('Proficiat!');
	}
};