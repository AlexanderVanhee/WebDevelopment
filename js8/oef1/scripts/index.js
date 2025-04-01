const setup = () => {
	const birthDay = new Date("2005-02-02T00:00:00.000Z");
	let diffrence = new Date() - birthDay;
	let diffrenceInDays = diffrence / 1000 / 60 / 60 / 24;
	let string = `${Math.floor(diffrenceInDays)} dagen (${Math.floor(diffrenceInDays / 364)} jaar)`;
	console.log(string);
	document.querySelector("p").textContent = string;
}

window.addEventListener("load", setup);