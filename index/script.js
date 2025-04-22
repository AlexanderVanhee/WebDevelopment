import { getExercisesFromPage } from "./getExercisesFromPage.js";
import { openSettingsPopUp } from "./settingsPopUp.js";
import { validateCurrentExercise } from "./validator.js";
let exercisesData = [];
let selectedChapter = 0;
let selectedExercise = null;
let consoleLogs = [];
// Split.js
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 800) {
        Split(['#sidebar', '#main-content'], {
            minSize: [300, 200],
            gutterSize: 5,
            sizes: [33, 67],
        });
    }
    loadExercisesData('./index/exercises.json');

    document.getElementById('scroll-left').addEventListener('click', scrollChaptersLeft);
    document.getElementById('scroll-right').addEventListener('click', scrollChaptersRight);
    document.getElementById('clear-console').addEventListener('click', clearConsole);

    const chapterTabs = document.getElementById('chapter-tabs');

    // Horizontaale scroll bij de chapterTab
    chapterTabs.addEventListener('wheel', (e) => {
        e.preventDefault();
        chapterTabs.scrollLeft += e.deltaY;
    });

    setupCopyButtons();
    initValidatorTab();

    document.getElementById('settings-button').addEventListener('click', () => {
        openSettingsPopUp();
    });
});

const initValidatorTab = () => {
    document.getElementById('validator-tab').addEventListener('click', () => {
        if (selectedExercise) {
            validateCurrentExercise(selectedExercise);
        }
    });
}


// Load exercises data from exercises.json file
export const loadExercisesData = async (location) => {
    try {
        // Determine data source and load accordingly
        exercisesData = location.endsWith('.json')
            ? await loadJsonExercises(location)
            : await getExercisesFromPage(location);

        // Setup UI with loaded exercises
        buildChapterTabs(exercisesData);
        buildMobileExercisesList(exercisesData);

        let creditTitle = document.getElementById('creditTitle');
        let consoleTab = document.getElementById(`console-tab`);

        // Hide console in external mode as CORS doesn't allow console intercepting there.
        if (location.endsWith('.json')) {
            consoleTab.classList.remove("hidden");
            creditTitle.textContent = '';
        } else {
            consoleTab.classList.add("hidden");
            let ghUsername = getGitHubUsername(location);

            if (ghUsername) {
                creditTitle.innerHTML = `Oefeningen van <a class="text-gray-700" href="https://github.com/${ghUsername}" target="_blank" rel="noopener noreferrer">${ghUsername}</a>`;
            } else {
                creditTitle.textContent = 'Oefeningen van John Doe';
            }
        }

        // Show first chapter if exercises exist
        if (exercisesData.length > 0) {
            showChapterExercises(0);
        }
    } catch (error) {
        console.error('Error loading exercises:', error);
        displayErrorMessage('Het is niet gelukt om de oefeningen te laden. Probeer de pagina opnieuw te verversen.');
    }
}

const getGitHubUsername = (url) => {
    try {
        let hostname = new URL(url).hostname;
        if (hostname.endsWith("github.io")) {
            let username = hostname.split(".github.io")[0];
            return username.charAt(0).toUpperCase() + username.slice(1);
        }
    } catch (e) {
        console.error("Invalid URL");
    }
    return null;
}


const loadJsonExercises = async (location) => {
    const response = await fetch(location);
    if (!response.ok) {
        throw new Error('Failed to load exercises data');
    }
    const data = await response.json();
    return data.tasks;
}

/*-----Chapters-----*/
const buildChapterTabs = (chapters) => {
    const chapterTabs = document.getElementById('chapter-tabs');
    chapterTabs.innerHTML = '';

    chapters.forEach((chapter, index) => {
        const tab = document.createElement('div');
        tab.className = `chapter-tab flex-shrink-0 px-4 py-2 mx-1 rounded-lg cursor-pointer transition-colors duration-200 ${index === 0 ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`;
        tab.dataset.index = index;
        tab.innerHTML = /*html*/`
            <div class="whitespace-nowrap font-medium">${chapter.title}</div>
            <div class="text-xs text-gray-500 whitespace-nowrap">${chapter.subtitle || ''}</div>
        `;

        tab.addEventListener('click', () => {
            // Update selected tab styling
            document.querySelectorAll('.chapter-tab').forEach(t => {
                t.classList.remove('bg-blue-100', 'text-blue-700', 'shadow-sm');
                t.classList.add('hover:bg-gray-100');
            });
            tab.classList.add('bg-blue-100', 'text-blue-700', 'shadow-sm');
            tab.classList.remove('hover:bg-gray-100');

            // Show exercises for the selected chapter
            selectedChapter = index;
            showChapterExercises(index);
        });

        chapterTabs.appendChild(tab);
    });
}

/*-----Exercises-----*/
const showChapterExercises = (chapterIndex) => {
    const chapterContent = document.getElementById('chapter-content');
    chapterContent.innerHTML = '';

    const chapter = exercisesData[chapterIndex];

    // Create chapter header
    const chapterHeader = document.createElement('div');
    chapterHeader.className = 'mb-4';
    chapterHeader.innerHTML = /*html*/`
        <h2 class="text-xl font-bold">${chapter.title}</h2>
        ${chapter.subtitle ? /*html*/`<p class="text-sm text-gray-500">${chapter.subtitle}</p>` : ''}
    `;

    // Create exercises list
    const exercisesList = document.createElement('div');
    exercisesList.className = 'space-y-2';

    // Add exercises to the lista
    chapter.exercises.forEach((exercise, exIndex) => {
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item shadow-sm flex items-center p-3 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150';
        exerciseItem.dataset.chapterIndex = chapterIndex;
        exerciseItem.dataset.exerciseIndex = exIndex;
        exerciseItem.dataset.path = exercise.path;

        const contentContainer = document.createElement('div');
        contentContainer.className = 'flex-1';
        contentContainer.innerHTML = /*html*/`
        <div class="font-medium max-w-[75%] overflow-hidden text-ellipsis whitespace-nowrap">
            ${exercise.title}
        </div>
        `;

        const divider = document.createElement('div');
        divider.className = 'w-[1.5px] h-12 bg-gray-200 mx-3';

        const linkContainer = document.createElement('div');
        linkContainer.className = 'flex items-center justify-center p-4';
        linkContainer.innerHTML = `<i class="ti ti-external-link text-gray-600"></i>`;
        linkContainer.addEventListener('click', (event) => {
            event.stopPropagation();
            window.open(exercise.path, '_blank');
        });
        linkContainer.className += ' hover:bg-gray-100 h-full rounded-r';

        exerciseItem.appendChild(contentContainer);
        exerciseItem.appendChild(divider);
        exerciseItem.appendChild(linkContainer);
        exerciseItem.addEventListener('click', () => handleExerciseClick(chapter, exercise, chapterIndex, exIndex));

        exercisesList.appendChild(exerciseItem);
    });


    // Assemble the chapter content
    chapterContent.appendChild(chapterHeader);
    chapterContent.appendChild(exercisesList);
}

// Scroll chapter list
const scrollChaptersLeft = () => {
    const tabsContainer = document.getElementById('chapter-tabs');
    tabsContainer.scrollBy({ left: -200, behavior: 'smooth' });
}
const scrollChaptersRight = () => {
    const tabsContainer = document.getElementById('chapter-tabs');
    tabsContainer.scrollBy({ left: 200, behavior: 'smooth' });
}

// Seperatly builds a simplified mobile list because mobile has only so much screen real-estate.
const buildMobileExercisesList = (chapters) => {
    const mobileList = document.getElementById('mobile-exercises-list');
    mobileList.innerHTML = '';

    chapters.forEach((chapter, chapterIndex) => {
        const chapterSection = document.createElement('div');
        chapterSection.className = 'bg-white rounded-lg shadow-sm p-4 mb-4';

        const chapterHeader = document.createElement('div');
        chapterHeader.className = 'flex items-center justify-between mb-2';
        chapterHeader.innerHTML = /*html*/`
            <h3 class="font-bold text-lg">${chapter.title}</h3>
        `;

        const exercisesList = document.createElement('div');
        exercisesList.className = 'space-y-2 mt-3';

        chapter.exercises.forEach((exercise) => {
            const exerciseItem = document.createElement('a');
            exerciseItem.href = exercise.path;
            exerciseItem.className = 'flex justify-between items-center p-2 border border-gray-200 rounded hover:bg-gray-50 text-sm';

            exerciseItem.innerHTML =  /*html*/`<span>${exercise.title}</span> <i class="ti ti-external-link"></i>`;
            exercisesList.appendChild(exerciseItem);
        });


        // Assemble the chapter section
        chapterSection.appendChild(chapterHeader);
        chapterSection.appendChild(exercisesList);
        mobileList.appendChild(chapterSection);
    });
}

// Function when pressing an exercise.
const handleExerciseClick = (chapter, exercise, chapterIndex, exerciseIndex) => {
    selectedExercise = {
        chapter,
        exercise,
        chapterIndex,
        exerciseIndex
    };

    // Update item card
    document.querySelectorAll('.exercise-item').forEach(item => {
        item.classList.remove('bg-blue-50', 'border-blue-300');
    });

    const selectedItem = document.querySelector(`.exercise-item[data-chapter-index="${chapterIndex}"][data-exercise-index="${exerciseIndex}"]`);
    if (selectedItem) {
        selectedItem.classList.add('bg-blue-50', 'border-blue-300');
    }

    // Hide empty state, show exercise content
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('exercise-content').classList.remove('hidden');

    // Update title and subtitle
    document.getElementById('exercise-title').textContent = exercise.title;
    document.getElementById('exercise-note').textContent = exercise.note;
    document.getElementById('exercise-note-span').classList.toggle('hidden', !exercise.note);
    document.getElementById('chapter-name').textContent = chapter.title;
    document.getElementById('exercise-name').textContent = exercise.title;

    resetTabStates();
    clearConsole();

    // Load the iframe
    const iframe = document.getElementById('preview-iframe');
    iframe.addEventListener('load', setupConsoleInterceptor);
    iframe.src = exercise.path;


    // Load the source files
    loadSourceFiles(exercise.path);


    iframe.onload = () => iframe.contentDocument?.head.appendChild(Object.assign(document.createElement("link"), { rel: "stylesheet", href: `${window.location.origin}/index/shared_styles.css` }));
}

/*-----Virtual Console-----*/
const setupConsoleInterceptor = () => {
    const iframe = document.getElementById('preview-iframe');
    if (!iframe.contentWindow) return;

    const consoleMethods = ['log', 'error', 'warn', 'info', 'clear'];
    const originalConsole = { ...iframe.contentWindow.console };

    consoleMethods.forEach(method => {
        iframe.contentWindow.console[method] = function (...args) {
            originalConsole[method].apply(this, args);
            if (method === 'clear') {
                clearConsole();
            } else {
                addConsoleLog(method, args);
            }
        };
    });

    iframe.contentWindow.addEventListener('error', event => {
        addConsoleLog('error', [`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`]);
    });

}

// Add a console log the custom log
const addConsoleLog = (type, args) => {
    const logElement = document.createElement('div');
    logElement.className = `console-log ${type !== 'log' ? 'console-' + type : ''}`;

    // timestamp
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'console-timestamp';
    timestampSpan.textContent = `[${timestamp}]`;
    logElement.appendChild(timestampSpan);

    // Format and add the message
    const formattedArgs = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');

    logElement.appendChild(document.createTextNode(formattedArgs));

    // Add to the console
    document.getElementById('console-logs').appendChild(logElement);

    // Auto-scroll to the bottom
    const consoleContainer = document.querySelector('.console-container');
    consoleContainer.scrollTop = consoleContainer.scrollHeight;

    // Store in our logs array
    consoleLogs.push({
        type,
        timestamp,
        message: formattedArgs
    });
}

// Clear the console
const clearConsole = () => {
    document.getElementById('console-logs').innerHTML = '';
    consoleLogs = [];

    // Add initial message
    const logElement = document.createElement('div');
    logElement.className = 'console-log';

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'console-timestamp';
    timestampSpan.textContent = `[info]`;
    logElement.appendChild(timestampSpan);
    logElement.appendChild(document.createTextNode('Hieronder kun je de console-output van de oefening lezen.'));

    document.getElementById('console-logs').appendChild(logElement);
}

/*-----Source Files-----*/
const loadSourceFiles = async (path) => {
    try {
        const tabs = ['html', 'css', 'js'];
        tabs.forEach(tab => document.getElementById(`${tab}-tab`).classList.add('hidden'));

        const lastSlashIndex = path.lastIndexOf('/');
        const directory = path.substring(0, lastSlashIndex + 1);

        const htmlResponse = await fetch(path);
        if (!htmlResponse.ok) throw new Error('Failed to load HTML file');
        const htmlText = await htmlResponse.text();
        await updateCodeDisplay('html', htmlText);

        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        // css
        const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
            .map(link => link.getAttribute('href'))
            .filter(href => href && !href.startsWith('http'));
        const styleElements = doc.querySelectorAll('style');

        if (cssLinks.length > 0) {
            const cssPath = resolvePath(cssLinks[0], directory);
            try {
                const cssResponse = await fetch(cssPath);
                if (cssResponse.ok) {
                    const cssText = await cssResponse.text();
                    await updateCodeDisplay('css', cssText);
                }
            } catch (error) {
                console.error('Error loading CSS:', error);
            }
        } else if (styleElements.length > 0) {
            await updateCodeDisplay('css', styleElements[0].textContent);
        }

        const scriptSrcs = Array.from(doc.querySelectorAll('script'))
            .map(script => script.getAttribute('src'))
            .filter(src => src && !src.startsWith('http') && !src.includes("___vscode_livepreview_injected_script"));

        const scriptElements = Array.from(doc.querySelectorAll('script'))
            .filter(script =>
                !script.hasAttribute('src') ||
                (script.getAttribute('src') && !script.getAttribute('src').includes("___vscode_livepreview_injected_script"))
            );

        if (scriptSrcs.length > 0) {
            const jsPath = resolvePath(scriptSrcs[0], directory);
            try {
                const jsResponse = await fetch(jsPath);
                if (jsResponse.ok) {
                    const jsText = await jsResponse.text();
                    await updateCodeDisplay('js', jsText);
                }
            } catch (error) {
                console.error('Error loading JS:', error);
            }
        } else if (scriptElements.length > 0) {
            const validScriptElement = scriptElements.find(script =>
                !script.outerHTML.includes("___vscode_livepreview_injected_script")
            );

            if (validScriptElement) {
                await updateCodeDisplay('js', validScriptElement.textContent);
            }
        }

        ensureTabSelection();
        setupCopyButtons();
    } catch (error) {
        console.error('Error loading source files:', error);
        displayErrorMessage('Het is niet gelukt om bepaalde source files te laden.');
    }
}

const resolvePath = (path, directory) => {
    if (path.startsWith('./')) {
        return directory + path.substring(2);
    } else if (!path.startsWith('/')) {
        return directory + path;
    }
    return path;
}

const updateCodeDisplay = async (type, content) => {
    if (!content || content.trim() === '') return false;

    const codeElement = document.getElementById(`${type}-code`);
    codeElement.textContent = content;
    codeElement.removeAttribute('data-highlighted');
    hljs.highlightElement(codeElement);
    hljs.initLineNumbersOnLoad();

    // Show tab if we have content
    document.getElementById(`${type}-tab`).classList.remove('hidden');
    return true;
}

const setupCopyButtons = () => {
    document.querySelectorAll('.copy-button').forEach(button => {
        let isProcessing = false;

        button.addEventListener('click', () => {
            if (isProcessing) return;

            const targetId = button.getAttribute('data-target');
            const codeElement = document.getElementById(targetId);
            const originalHTML = '<i class="ti ti-copy mr-1"></i>Copy';

            isProcessing = true;

            navigator.clipboard.writeText(codeElement.textContent)
                .then(() => {
                    button.innerHTML = '<i class="ti ti-check mr-1"></i>Copied!';
                    button.classList.add('bg-green-100', 'text-green-700');
                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.classList.remove('bg-green-100', 'text-green-700');
                        isProcessing = false;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    button.innerHTML = '<i class="ti ti-alert-triangle mr-1"></i>Failed';
                    button.classList.add('bg-red-100', 'text-red-700');
                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.classList.remove('bg-red-100', 'text-red-700');
                        isProcessing = false;
                    }, 2000);
                });
        });
    });
}

const ensureTabSelection = () => {
    const tabs = ['html', 'css', 'js'];
    const hasVisibleTabs = tabs.some(tab =>
        !document.getElementById(`${tab}-tab`).classList.contains('hidden')
    );

    // If no other tabs are visible or the selected tab is hidden, switch to preview
    if (!hasVisibleTabs || document.querySelector('.border-b-2.font-medium')?.classList.contains('hidden')) {
        switchTab('preview');
    }
}

/*-----TABS-----*/
const tabs = [
    { name: 'preview', color: 'border-blue-500 text-blue-600' },
    { name: 'html', color: 'border-orange-500 text-orange-600' },
    { name: 'css', color: 'border-blue-700 text-blue-700' },
    { name: 'js', color: 'border-yellow-300 text-yellow-400' },
    { name: 'console', color: 'border-[#74275e] text-[#74275e]' },
    { name: 'validator', color: 'border-sky-800 text-sky-800' }
];

tabs.forEach(tab => {
    document.getElementById(`${tab.name}-tab`).addEventListener('click', () => switchTab(tab.name));
});

const switchTab = (tabName) => {
    tabs.forEach(tab => {
        document.getElementById(`${tab.name}-content`).classList.add('hidden');
    });

    // Reset css for all tabs but keep the hidden ones hidden
    tabs.forEach(tabId => {
        const tab = document.getElementById(`${tabId.name}-tab`);
        const isHidden = tab.classList.contains('hidden');
        tab.className = `px-4 py-2 text-gray-600 hover:text-gray-800 ${isHidden ? 'hidden' : ''}`;
    });

    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    const selectedTab = tabs.find(tab => tab.name === tabName);
    document.getElementById(`${tabName}-tab`).className = `px-4 py-2 border-b-2 font-medium ${selectedTab.color}`;
}

const resetTabStates = () => {
    switchTab('preview');
}

// Display error message
const displayErrorMessage = (message) => {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md';
    errorAlert.innerHTML = /*html*/`
        <div class="flex items-center">
            <i class="ti ti-alert-circle mr-2"></i>
            <span>${message}</span>
        </div>`;
    document.body.appendChild(errorAlert);
    setTimeout(() => {
        errorAlert.remove();
    }, 10000);
}
