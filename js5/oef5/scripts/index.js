document.addEventListener('DOMContentLoaded', () => {
	const validateBtn = document.getElementById('validateBtn');
	validateBtn.addEventListener('click', validateForm);
});

const showError = (element, message) => {
	element.classList.add('invalid');
	document.getElementById(`${element.id}-error`).textContent = message;
};

const resetValidation = () => {
	const inputs = document.querySelectorAll('input');
	inputs.forEach(input => {
		input.classList.remove('invalid');
		document.getElementById(`${input.id}-error`).textContent = '';
	});
};

const validateFirstName = () => {
	const firstName = document.getElementById('firstName');
	if (firstName.value.length > 30) {
		showError(firstName, 'max. 30 karakters');
		return false;
	}
	return true;
};

const validateLastName = () => {
	const lastName = document.getElementById('lastName');
	if (lastName.value.length === 0) {
		showError(lastName, 'verplicht veld');
		return false;
	}
	if (lastName.value.length > 50) {
		showError(lastName, 'max 50 karakters');
		return false;
	}
	return true;
};

const validateBirthDate = () => {
	const birthDate = document.getElementById('birthDate');
	if (birthDate.value.length === 0) {
		showError(birthDate, 'verplicht veld');
		return false;
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate.value)) {
		showError(birthDate, 'formaat is niet jjjj-mm-dd');
		return false;
	}
	return true;
};

const validateEmail = () => {
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

const validateChildren = () => {
	const children = document.getElementById('children');
	const childrenValue = parseInt(children.value);
	if (isNaN(childrenValue) || childrenValue < 0) {
		showError(children, 'is geen positief getal');
		return false;
	}
	if (childrenValue >= 99) {
		showError(children, 'is te vruchtbaar');
		return false;
	}
	return true;
};

const validateForm = () => {
	resetValidation();

	const firstNameValid = validateFirstName();
	const lastNameValid = validateLastName();
	const birthDateValid = validateBirthDate();
	const emailValid = validateEmail();
	const childrenValid = validateChildren();

	if (firstNameValid && lastNameValid && birthDateValid && emailValid && childrenValid) {
		alert('Proficiat!');
	}
};
