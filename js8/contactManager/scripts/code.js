const g = {
    personen: [],
    selectedIndex: -1,
    FIELD_IDS: [["txtVoornaam", "voornaam"], ["txtFamilienaam", "familienaam"], ["txtGeboorteDatum", "geboorteDatum"],
    ["txtEmail", "email"], ["txtAantalKinderen", "aantalKinderen"]],
    DEFAULT_ENTRIES: [
        {
            voornaam: 'Jan',
            familienaam: 'Janssens',
            geboorteDatum: new Date('2010-10-10'),
            email: 'jan@example.com',
            aantalKinderen: 0
        },
        {
            voornaam: 'Mieke',
            familienaam: 'Mickelsen',
            geboorteDatum: new Date('1980-01-01'),
            email: 'mieke@example.com',
            aantalKinderen: 1
        },
        {
            voornaam: 'Piet',
            familienaam: 'Pieters',
            geboorteDatum: new Date('1970-12-31'),
            email: 'piet@example.com',
            aantalKinderen: 2
        }
    ],
    fieldConverters: {
        toObject: {
            geboorteDatum: value => new Date(value),
            aantalKinderen: value => parseInt(value, 10)
        },
        toForm: {
            geboorteDatum: value => value instanceof Date ? value.toISOString().split('T')[0] : value
        }
    }
};

const formToObject = () => {
    const obj = {};
    g.FIELD_IDS.forEach(([inputId, propName]) => {
        let value = document.getElementById(inputId).value;
        // custom conversion if needed
        if (g.fieldConverters.toObject[propName]) {
            value = g.fieldConverters.toObject[propName](value);
        }
        obj[propName] = value;
    });
    return obj;
};

const objectToForm = (obj) => {
    g.FIELD_IDS.forEach(([inputId, propName]) => {
        let value = obj[propName];
        // custom conversion if needed
        if (g.fieldConverters.toForm[propName]) {
            value = g.fieldConverters.toForm[propName](value);
        }
        document.getElementById(inputId).value = value;
    });
};

const convertStoredData = (data) => {
    return data.map(item => {
        const processedItem = { ...item };
        // use same as to object
        for (const [propName, converter] of Object.entries(g.fieldConverters.toObject)) {
            if (propName in item) {
                processedItem[propName] = converter(item[propName]);
            }
        }
        return processedItem;
    });
};

// Bewaar de wijzigingen die in de user interface werden aangebracht
const submitFormData = (event) => {
    event.preventDefault();
    if (!valideer()) {
        return;
    }
    const formData = formToObject();
    // Check if were editing an existing entry or creating a new one
    if (g.selectedIndex >= 0 && g.selectedIndex < g.personen.length) {
        // Update
        g.personen[g.selectedIndex] = formData;
        g.selectedIndex = -1;
    } else {
        // New
        g.personen.push(formData);
    }
    refreshList();
    resetForm();
};


const refreshList = () => {
    localStorage.setItem("personen", JSON.stringify(g.personen));
    const list = document.querySelector("#lstPersonen");
    list.replaceChildren();
    g.personen.forEach((person, index) => {
        let option = document.createElement('option');
        option.setAttribute("value", index);
        option.textContent = `${person.voornaam} ${person.familienaam}`;
        list.appendChild(option);
        option.addEventListener("click", () => {
            g.selectedIndex = index;
            objectToForm(person);
        });
    });
};

const resetForm = () => {
    g.FIELD_IDS.forEach(([inputId]) => {
        document.getElementById(inputId).value = "";
    });
    g.selectedIndex = -1;
};

const deleteEntry = () => {
    const list = document.querySelector("#lstPersonen");
    if (list.value) {
        g.personen.splice(parseInt(list.value), 1);
        resetForm();
        refreshList();
    }
};

const setup = () => {
    document.getElementById("btnBewaar").addEventListener("click", submitFormData);
    document.getElementById("btnNieuw").addEventListener("click", resetForm);
    document.querySelector("#btnVerwijder").addEventListener("click", deleteEntry);

    let personenLS = JSON.parse(localStorage.getItem('personen'));
    if (personenLS) {
        // Convert stored data to proper types before using it
        g.personen = convertStoredData(personenLS);
    } else {
        g.personen = g.DEFAULT_ENTRIES;
    }

    refreshList();
};

window.addEventListener("load", setup);