const setup = () => {
	const birthDay = new Date("2005-02-02T00:00:00.000Z");
	let diffrence = new Date() - birthDay;
	let diffrenceInDays = diffrence /1000 /60 /60 /24;
	console.log(`${Math.floor(diffrenceInDays)} dagen (${Math.floor(diffrenceInDays/364)} jaar)`);
}

window.addEventListener("load", setup);