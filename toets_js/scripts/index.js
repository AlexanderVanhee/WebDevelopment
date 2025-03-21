const setup = () => {
    document.getElementById("dropdown").addEventListener('change', () =>{
        console.log("changed");
        const img = document.getElementById("img")
        if(document.getElementById("dropdown").value === ''){
            img.classList.add('hidden');

        }else{
            img.classList.remove('hidden');
            if(document.getElementById("dropdown").value === 'on'){
                img.setAttribute('src','with-egg.png' );
            }else{
                img.setAttribute('src','without-egg.png' );
            }
        }

    });
    const searchString = document.getElementById("searchString");
    const string = "Hierboven een kip met een ei";
    searchString.addEventListener('change', () =>{
        console.log("changed");
        const appearances = string.split(searchString.value).length -1;
        document.getElementById("text").textContent = `Letter ${searchString.value} komt ${appearances} voor in de bovestaande zin`;
    });
}


window.addEventListener("load", setup);