// Function to validate HTML using W3C Validator API
export const validateHTML = async (html) => {
    try {
        // W3C validator API endpoint - note the ?out=json parameter in the URL
        const validatorUrl = 'https://validator.w3.org/nu/?out=json';

        // Send the request to the validator
        const response = await fetch(validatorUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Accept': 'application/json'
            },
            body: html
        });

        // If CORS is an issue (likely will be), use this alternate approach
        if (!response.ok) {
            return await validateHTMLViaCorsProxy(html);
        }

        return await response.json();
    } catch (error) {
        console.error('Error validating HTML:', error);
        return { messages: [{ type: 'error', message: 'Failed to validate HTML. API error or CORS issue.' }] };
    }
}

// Proxy
const validateHTMLViaCorsProxy = async (html) => {
    try {
        const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/https://validator.w3.org/nu/?out=json';

        const response = await fetch(corsProxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Origin': window.location.origin
            },
            body: html
        });

        if (!response.ok) {
            console.error('CORS proxy validation failed');
            return { messages: [{ type: 'info', message: 'Validation unavailable. Consider using the official W3C Validator: https://validator.w3.org/#validate_by_input' }] };
        }

        return await response.json();
    } catch (error) {
        console.error('Error with CORS proxy validation:', error);
        return { messages: [{ type: 'info', message: 'Direct validation is not possible due to browser restrictions. Please use the W3C Validator directly: https://validator.w3.org/#validate_by_input' }] };
    }
}

// Function to display validation results in the validator tab
export const displayValidationResults = (results, selectedExercise) => {
    const validatorContent = document.getElementById('validator-content');
    validatorContent.innerHTML = '';

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'p-4 h-full overflow-y-auto';

    // Header
    const header = document.createElement('div');
    header.className = 'mb-4';
    const errorCount = results.messages.filter(msg => msg.type === 'error').length;
    const warningCount = results.messages.filter(msg => msg.type === 'warning' || msg.type === 'info').length;
    if (errorCount === 0 && warningCount === 0) {
        header.innerHTML = /* html */
            `
            <div class="flex items-center mb-2 text-green-600">
                <i class="ti ti-circle-check text-2xl mr-2"></i>
                <h3 class="text-lg font-bold">Document is geldig!</h3>
            </div>
            <p class="text-gray-600">Geen fouten of waarschuwingen gevonden in het HTML-bestand.</p>
        `;
    } else {
        header.innerHTML = /* html */
            `
            <div class="flex items-center mb-2 ${errorCount > 0 ? 'text-red-600' : 'text-yellow-600'}">
                <i class="ti ti-${errorCount > 0 ? 'alert-triangle' : 'alert-circle'} text-2xl mr-2"></i>
                <h3 class="text-lg font-bold">Validatie ${errorCount > 0 ? 'mislukt' : 'gelukt met waarschuwingen'}</h3>

            </div>
            <p class="text-gray-600">${errorCount} fouten en ${warningCount} waarschuwingen gevonden in het HTML-bestand.</p>
        `;
    }

    resultsContainer.appendChild(header);

    // list
    if (results.messages.length > 0) {
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'space-y-3 mt-4';

        results.messages.forEach((message, index) => {
            const messageElement = document.createElement('div');
            let bgColor, borderColor, iconName;
            if (message.type === 'error') {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-300';
                iconName = 'alert-triangle';
            } else if (message.type === 'warning') {
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-300';
                iconName = 'alert-circle';
            } else {
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-300';
                iconName = 'info-circle';
            }

            messageElement.className = `p-3 ${bgColor} border-l-4 ${borderColor} rounded`;

            // Create message content with line and column information if available
            let locationInfo = '';
            if (message.lastLine) {
                locationInfo = /* html */`<span class="text-gray-600">Line ${message.lastLine}`;
                if (message.lastColumn) {
                    locationInfo += `, Column ${message.lastColumn}`;
                }
                locationInfo += '</span>';
            }

            // Extract and format the extract (code snippet) if available
            let extractHTML = '';
            if (message.extract) {
                extractHTML = /* html */`
                    <div class="mt-2 bg-gray-800 text-white p-2 rounded text-sm overflow-x-auto">
                        <code>${escapeHTML(message.extract)}</code>
                    </div>
                `;
            }

            messageElement.innerHTML = /* html */`
                <div class="flex items-start">
                    <i class="ti ti-${iconName} mt-1 mr-2"></i>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <strong class="text-sm capitalize">${message.type}</strong>
                            ${locationInfo}
                        </div>
                        <p class="text-sm mt-1">${escapeHTML(message.message)}</p>
                        ${extractHTML}
                    </div>
                </div>
            `;

            messagesContainer.appendChild(messageElement);
        });

        resultsContainer.appendChild(messagesContainer);
    }


    const validationButtonContainer = document.createElement('div');
    validationButtonContainer.className = 'mt-4 flex justify-end';
    validationButtonContainer.innerHTML = /* html */`
        <button id="revalidate-button" class="copy-button absolute top-2 right-4 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm flex items-center z-10">
            <i class="ti ti-refresh mr-1"></i> Hervalideer
        </button>
    `;
    resultsContainer.appendChild(validationButtonContainer);

    validatorContent.appendChild(resultsContainer);

    document.getElementById('revalidate-button').addEventListener('click', () => {
        validateCurrentExercise(selectedExercise);
    });
}

// Escape with entitites
const escapeHTML = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Function to validate the current exercise
export const validateCurrentExercise = async (selectedExercise) => {
    if (!selectedExercise) return;

    // Loader
    const validatorContent = document.getElementById('validator-content');
    validatorContent.innerHTML = /* html */`
        <div class="flex items-center justify-center h-full">
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-3"></div>
                <p class="text-gray-600">HTML aan het valideren...</p>
            </div>
        </div>
    `;

    const htmlCode = document.getElementById('html-code').textContent;
    const validationResults = await validateHTML(htmlCode);
    displayValidationResults(validationResults, selectedExercise);
}
