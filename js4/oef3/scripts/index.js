const setup = () => {
	document.getElementById("button").addEventListener("click", printSplitValue)

}

const printSplitValue = () => {
	let string = document.getElementById("input").value;
	let splitString = string.split("").join(" ");
	document.getElementById("output").textContent = splitString;
	console.log(splitString);
}

window.addEventListener("load", setup);