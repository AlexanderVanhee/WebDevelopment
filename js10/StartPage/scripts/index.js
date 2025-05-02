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

class Popup {
	constructor(content, title = null) {
		this.background = document.createElement('div');
		this.background.className = 'popup-background';
		document.body.appendChild(this.background);

		this.element = document.createElement('div');
		this.element.className = title ? 'popup' : 'popup popup-no-title';
		if (title) {
			const header = document.createElement('div');
			header.className = 'popup-header';

			const titleEl = document.createElement('h3');
			titleEl.className = 'popup-title';
			titleEl.textContent = title;

			const closeBtn = document.createElement('button');
			closeBtn.className = 'close-btn';
			closeBtn.textContent = '×';

			header.appendChild(titleEl);
			header.appendChild(closeBtn);
			this.element.appendChild(header);
		} else {
			const closeBtn = document.createElement('button');
			closeBtn.className = 'close-btn';
			closeBtn.textContent = '×';
			this.element.appendChild(closeBtn);
		}

		const contentDiv = document.createElement('div');
		contentDiv.textContent = content;
		this.element.appendChild(contentDiv);

		document.body.appendChild(this.element);
		this.element.querySelector('.close-btn').addEventListener('click', () => this.close());
	}

	close() {
		this.element.remove();
		this.background.remove();
	}
}

class StartPage {
	constructor() {
		this.storage = {
			cardKey: "startPage.cardKey",
			sortDirectionKey: "startPage.sortDirection"
		};
		this.state = [
			{ key: "g", name: "Google", color: "#2f70e9", function: (i) => `https://www.google.com/search?q=${i.replace(" ", "+")}` },
			{ key: "y", name: "Youtube", color: "#FF0000", function: (i) => `https://www.youtube.com/results?search_query=${i.replace(" ", "+")}` },
			{ key: "x", name: "X", color: "#1d9bf0", function: (i) => `https://x.com/search?q=${i.replace(" ", "%20")}` },
			{ key: "i", name: "Instagram", color: "#fc0077", function: (i) => `https://www.instagram.com/explore/tags/${i.replace(" ", "")}/` },
			{ key: "d", name: "DuckDuckGo", color: "#de5833", function: (i) => `https://duckduckgo.com/?t=h_&q=${i.replace(" ", "+")}` },
			{ key: "t", name: "TikTok", color: "#fe2c55", function: (i) => `https://www.tiktok.com/search?q=${i.replace(" ", "%20")}` },
		];
		this.sortAscending = this.loadSortDirection();
		this.elements = {};
		this.init();
		this.setupEventListeners();
	}

	init() {
		this.initElements();
		this.loadCards();
		this.updateSortButtonText();
	}

	initElements() {
		console.log("initializing elements")
		this.elements.commandInput = document.querySelector('#command-input');
		this.elements.goButton = document.querySelector('#go-button');
		this.elements.cardsContainer = document.querySelector('#cards-container');
		this.elements.changeSort = document.querySelector("#change-sort");
	}

	setupEventListeners() {
		this.elements.goButton.addEventListener("click", this.submit.bind(this));
		this.elements.commandInput.addEventListener("keyup", (event) => {
			if (event.key === "Enter") {
				this.submit();
			}
		});

		this.elements.changeSort.addEventListener("click", this.changeSortDirection.bind(this));
	}

	submit() {
		const inputValue = this.elements.commandInput.value;
		const commando = this.parseCommando(inputValue); // Name , color, func
		const query = StartPage.parseQuery(inputValue);

		commando.link = commando.function(query);
		this.openLink(commando.link);
		commando.query = query;
		delete commando.function;

		this.saveToStorage(commando);
		this.resetInput();
		this.refreshCardDisplay();
	}

	parseCommando(input) {
		if (!input.startsWith("/")) {
			this.resetInput();
			new Popup('start your command with /[character]', 'Error');
			throw new Error("Invalid start", commando);
		}
		const commando = input.split(" ")[0].slice(1, 2);

		let returnValue;
		this.state.forEach(s => {
			if (s.key === commando) {
				returnValue = s;
			}
		})

		if (returnValue === null) {
			this.resetInput();
			new Popup(`Unkown commando "${commando}"`, 'Error');
			throw new Error("Invalid commando", commando);
		}
		return returnValue;
	}

	static parseQuery(input) {
		const words = input.split(" ").slice(1, -0).join(" ");
		return input.slice(3, 100);
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
		link.setAttribute("target", "_blank")
		link.textContent = "GO!"

		div.appendChild(queryTitle);
		div.appendChild(queryText);
		div.appendChild(link);
		this.elements.cardsContainer.appendChild(div);
	}

	changeSortDirection() {
		this.sortAscending = !this.sortAscending;
		this.saveSortDirection();
		this.updateSortButtonText();
		this.refreshCardDisplay();
	}

	updateSortButtonText() {
		this.elements.changeSort.textContent = this.sortAscending ? "Sort: A → Z" : "Sort: Z → A";
	}

	saveSortDirection() {
		StorageUtil.set(this.storage.sortDirectionKey, this.sortAscending);
	}

	loadSortDirection() {
		return StorageUtil.has(this.storage.sortDirectionKey)
			? StorageUtil.get(this.storage.sortDirectionKey)
			: true;
	}

	saveToStorage(command) {
		if (StorageUtil.has(this.storage.cardKey)) {
			const list = StorageUtil.get(this.storage.cardKey);
			list.push(command);
			StorageUtil.set(this.storage.cardKey, list);
			return;
		}
		const list = [];
		list.push(command);
		StorageUtil.set(this.storage.cardKey, list);
	}

	loadCards() {
		this.refreshCardDisplay();
	}

	getSortedCards() {
		if (!StorageUtil.has(this.storage.cardKey)) {
			return [];
		}
		const list = StorageUtil.get(this.storage.cardKey);

		return list.sort((a, b) => {
			const nameComparison = a.name.localeCompare(b.name);
			if (nameComparison === 0) {
				return a.query.localeCompare(b.query);
			}

			return nameComparison;
		});
	}

	refreshCardDisplay() {
		this.elements.cardsContainer.innerHTML = '';
		let sortedCards = this.getSortedCards();
		if (!this.sortAscending) {
			sortedCards = sortedCards.reverse();
		}
		sortedCards.forEach(card => {
			this.addCard(card);
		});
	}

	resetInput() {
		this.elements.commandInput.value = ""
	}

	openLink(url) {
		window.open(url, '_blank');
	}
}

window.addEventListener('load', () => new StartPage());