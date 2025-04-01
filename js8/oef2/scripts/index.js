const setup = () => {
	document.querySelector("button").addEventListener("click", parseJson);
	const student1 = {
		firstName: "Alexander",
		lastName: "Vanhee",
		age: 20,
		course: {
			code: "ti",
			name: "Toegepaste Informatica",
			location: "Kortrijk"
		},
		birthDay: Date("2005-02-02T00:00:00.000Z"),
		food: ["banaan", "peer", "appel"]
	}

	console.log(JSON.stringify(student1));
	let input = document.querySelector("#output");
	input.value = JSON.stringify(student1);
}

const parseJson = () => {
	let jsonString = document.querySelector("#input").value;
	let jsonObj;

	try {
		jsonObj = JSON.parse(jsonString);
		console.log(jsonObj);

		let outputDiv = document.querySelector("div");
		outputDiv.replaceChildren();

		let ul = createNestedList(jsonObj);
		outputDiv.appendChild(ul);

	} catch (e) {
		let outputDiv = document.querySelector("div");
		outputDiv.replaceChildren();
		outputDiv.textContent = "Invalid JSON input.";
		console.error("Parsing error:", e);
	}
}

const createNestedList = (obj) => {
	let ul = document.createElement("ul");
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			let li = document.createElement("li");
			if (typeof obj[key] === 'object' && obj[key] !== null) {
				li.textContent = `${key}: `;
				let nestedUl = createNestedList(obj[key]);
				li.appendChild(nestedUl);
			} else {
				li.textContent = `${key}: ${obj[key]}`;
			}
			ul.appendChild(li);
		}
	}
	return ul;
}

window.addEventListener("load", setup);
