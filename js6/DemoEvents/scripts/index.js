const setup = () => {
    let texts=document.querySelectorAll(".text");
	texts.forEach(t => {t.addEventListener("click", klik)});
}


const klik = (event) => {
	event.target.style.color="red";
};

window.addEventListener("load", setup);