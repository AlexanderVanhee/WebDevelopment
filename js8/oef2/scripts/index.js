const setup = () => {
	document.querySelector("button").addEventListener("click", parseJson);
	const student1 = {
		firstName:"Alexander",
		lastName: "Vanhee",
		age: 20,
		course: {
			code: "ti",
			name: "Toegepaste Informatica",
			location: "Kortrijk"
		},
		birthDay: Date("2005-02-02T00:00:00.000Z")
	}

	console.log(JSON.stringify(student1));
	let input = document.querySelector("#output");
	input.value = JSON.stringify(student1);

}

const parseJson = () => {
	let jsonString = document.querySelector("#input").value;
	let jsonObj = JSON.parse(jsonString);

	console.log(jsonObj);
	document.querySelector("span").textContent = JSON.stringify(jsonObj);
}

window.addEventListener("load", setup);