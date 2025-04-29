class StorageUtil { // Abstractie van localStorage voor objecten.
	static get(key) {
	  const data = localStorage.getItem(key);
	  return data ? JSON.parse(data) : null;
	}
  
	static set(key, value) {
	  localStorage.setItem(key, JSON.stringify(value));
	}
  
	static remove(key) {
	  localStorage.removeItem(key);
	}
  
	static has(key) {
	  return localStorage.getItem(key) !== null;
	}
}

class StartPage{
	constructor() {
		this.storage = {
			cardKey: "startPage.cardKey"
		};

		this.state = [
			{key:"g",name:"Google",color: "#2f70e9",function: (i) =>`https://www.google.com/search?q=${i.replace(" ", "+")}`},
			{key:"y", name:"Youtube",color: "#FF0000",function: (i) =>`https://www.youtube.com/results?search_query=${i.replace(" ", "+")}`},
			{key:"t", name:"Twitter",color: "#1d9bf0",function:(i) =>`https://x.com/search?q=${i.replace(" ", "%20")}`}
		]

	
		this.elements = {};
		this.init();
		this.setupEventListeners();
	  }
	
	init() {
		this.initElements();
		this.loadCards();
	}

	initElements() {
		console.log("initializing elements")
		this.elements.commandInput = document.querySelector('#command-input');
		this.elements.goButton = document.querySelector('#go-button');
		this.elements.cardsContainer = document.querySelector('#cards-container');
	}


	setupEventListeners() {
		this.elements.goButton.addEventListener("click", this.submit.bind(this));
	}

	submit() {
		const inputValue = this.elements.commandInput.value;
		const commando = this.parseCommando(inputValue); // Name , color, func
		const query = this.parseQuery(inputValue);

		// Manipulate to saved object
		commando.link = commando.function(query);
		commando.query = query;
		delete commando.function;

		this.addCard(commando);
		this.saveToStorage(commando);

		this.resetInput();
	}

	parseCommando(input) {
		if (!input.startsWith("/")){
			throw new Error("Commando not found");
		}
		const commando = input.slice(1,2)
		if (commando == "g") {
			return {name:"Google",color: "#2f70e9",function: (i) =>`https://www.google.com/search?q=${i.replace(" ", "+")}`};
		}
		if (commando == "y") {
			return {name:"Youtube",color: "#FF0000",function: (i) =>`https://www.youtube.com/results?search_query=${i.replace(" ", "+")}`};
		}

		if (commando == "t") {
			return {name:"Twitter",color: "#1d9bf0",function:(i) =>`https://x.com/search?q=${i.replace(" ", "%20")}`};
		}

		this.resetInput();
		throw new Error("Invalid commando");

	}

	parseQuery(input) {
		return input.slice(3,100);
	}

	addCard(commandInfo) {
		const div = document.createElement("div");
		div.classList.add("card");
		div.style.backgroundColor = commandInfo.color;
		const queryTitle = document.createElement("h2");
		queryTitle.textContent = commandInfo.name;
		const queryText = document.createElement("p");
		queryText.textContent = commandInfo.query;
		const link = document.createElement("a");
		link.setAttribute("href", commandInfo.link);
		link.setAttribute("target" , "_blank")
		link.textContent = "GO!"

		div.appendChild(queryTitle);
		div.appendChild(queryText);
		div.appendChild(link);
		this.elements.cardsContainer.appendChild(div);
	}

	saveToStorage (command) {
		if(StorageUtil.has(this.storage.cardKey)){
			const list = StorageUtil.get(this.storage.cardKey);
			list.push( command);
			StorageUtil.set(this.storage.cardKey, list);
			return;
		}
		const list= [];
		list.push(command);
		StorageUtil.set(this.storage.cardKey, list);
	}

	loadCards() {
		if(StorageUtil.has(this.storage.cardKey)){
			const list = StorageUtil.get(this.storage.cardKey);
			list.forEach(element => {
				this.addCard(element);
			});
		}
	}

	resetInput() {
		this.elements.commandInput.value = ""
	}

	
}


window.addEventListener('load', () => new StartPage());