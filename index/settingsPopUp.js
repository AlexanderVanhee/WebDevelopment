import { loadExercisesData } from "./script.js";

/*-----Pop Up for settings menu-----*/
export const openSettingsPopUp = () => {
    const popupContainer = document.createElement('div');
    popupContainer.id = 'popupContainer';
    popupContainer.className = 'fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center select-none';

    const popupContent = document.createElement('div');
    popupContent.className = 'bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-95';

    popupContent.innerHTML = /*html*/ `
    <h2 class="text-2xl font-bold mb-4 text-gray-900">Andere oefeningen laden</h2>
    <p class="text-sm text-gray-700 mb-4">Voer de startpagina van een andere site in.</p>
    
    <input 
        type="text" 
        id="exercises-link-input" 
        placeholder="https://example.github.io/webdevelopment/" 
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-4 transition"
    >
    
    <div class="flex justify-end gap-3">
        <button id="cancel-link-btn" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Annuleren
        </button>
        <button id="load-link-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Laden
        </button>
    </div>
    `;

    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);

    const inputElement = document.getElementById('exercises-link-input');
    const cancelButton = document.getElementById('cancel-link-btn');
    const loadButton = document.getElementById('load-link-btn');

    const closePopup = () => {
        document.body.removeChild(popupContainer);
    }
    cancelButton.addEventListener('click', closePopup);

    loadButton.addEventListener('click', () => {
        const link = inputElement.value.trim();

        if (link) {
            try {
                new URL(link);

                closePopup();
                loadExercisesData(link);
            } catch (error) {
                inputElement.classList.add('border-red-500', 'focus:ring-red-500');
                inputElement.setAttribute('placeholder', 'Voer een geldige URL in');
                inputElement.value = '';
            }
        } else {
            closePopup();
            loadExercisesData('./index/exercises.json');
        }
    });

    popupContainer.addEventListener('click', (e) => {
        if (e.target === popupContainer) {
            closePopup();
        }
    });

    inputElement.focus();
}
