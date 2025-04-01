let personen = [];


const fieldIds=[["txtVoornaam", "voornaam"], ["txtFamilienaam", "familienaam"], ["txtGeboorteDatum", "geboorteDatum"],
["txtEmail", "email"], ["txtAantalKinderen" , "aantalKinderen"]];

// Bewaar de wijzigingen die in de user interface werden aangebracht
const submitFormData = () => {
    // valideer alle input data en controleer of er geen errors meer zijn
    if (!valideer()){
        return;
    }



    let form = {};

    fieldIds.forEach(formEntry => {
        form[formEntry[1]] = document.getElementById(formEntry[0]).value;
    });


    if (hasDoubles(form)){
        return;
    }

    personen.push(form);

    refreshList();
    resetForm();
};

const hasDoubles = (form) => {
    let jsonForm = JSON.stringify(form);
    personen.forEach(persoon => {
        console.log("1" + JSON.stringify(persoon));
        console.log("2" +jsonForm);
        if (JSON.stringify(persoon) == jsonForm){
            return true;
        }
    })
    return false;
}

const refreshList = () => {
    localStorage.setItem("personen", JSON.stringify(personen));
    const list = document.querySelector("#lstPersonen");
    list.innerHTML = '';
    let optionList = [];
    personen.forEach( (person, index) => {
        let option = document.createElement('option');
        // Using value instead of Id to avoid possible collisions.
        option.setAttribute("value",index );
        option.textContent = `${person.voornaam} ${person.familienaam}`;
        list.appendChild(option);
        optionList.push(option);
    });

    optionList.forEach(option => option.addEventListener("click", (event) => {
        let index = event.target.getAttribute("value");
        let person = personen[index];
        fieldIds.forEach(formEntry => {
            document.getElementById(formEntry[0]).value = person[formEntry[1]]
        });
    }));
}



// Event listener (btnNieuw click)
const resetForm = () => {
    fieldIds.forEach(formEntry => {
        document.getElementById(formEntry[0]).value = "";
    });
};

const deleteEntry = () => {
    const list = document.querySelector("#lstPersonen");
    console.log(list.value);
    personen.splice(list.value,1);
    refreshList();
}


// onze setup functie die de event listeners registreert
const setup = () => {
    let btnBewaar = document.getElementById("btnBewaar");
    btnBewaar.addEventListener("click", submitFormData);

    let btnNieuw = document.getElementById("btnNieuw");
    btnNieuw.addEventListener("click", resetForm);

    let btnDelete = document.querySelector("#btnVerwijder");
    btnDelete.addEventListener("click", deleteEntry);

    let lstPersonen = document.getElementById("lstPersonen");

    let personenLS = JSON.parse(localStorage.getItem('personen'));
    if (personenLS) {
        personen = personenLS;
    }
    refreshList();
};

window.addEventListener("load", setup);