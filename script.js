function generateExerciseLists(data) {
    const container = document.getElementById('exercises-container');
    const sidebarNav = document.getElementById('sidebarNav');

    data.tasks.forEach((task, taskIndex) => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'mb-8';
        taskDiv.id = `task-${taskIndex}`;
        taskDiv.innerHTML = `<h2 class="text-2xl font-semibold">${task.title}</h2><p>${task.subtitle}</p><br>`;

        const accordion = document.createElement('div');
        accordion.className = 'space-y-4';

        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
        <a href="#task-${taskIndex}" 
            class="text-white hover:bg-gray-700 hover:text-blue-500 transition-all duration-300 px-4 py-2 rounded-md bg-transparent w-full block">
            ${task.title}
        </a>`;
        sidebarNav.appendChild(taskItem);

        task.exercises.forEach((exercise, exerciseIndex) => {
            const card = document.createElement('div');
            card.className = 'bg-gray-800 rounded-lg shadow-md p-4';
            card.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <p class="text-left text-lg font-semibold">
                        ${exercise.title}
                    </p>
                    <div class="flex items-center space-x-2">
                        <a href="${exercise.path}" class="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full">
                            <i class="ti ti-external-link"></i>
                        </a>

                        <!-- Open Externally Button with Icon -->
                        <button class="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full" onclick="loadIframe('${exercise.path}')">
                            <i class="ti ti-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            accordion.appendChild(card);
        });

        taskDiv.appendChild(accordion);
        container.appendChild(taskDiv);
    });
}

function loadIframe(path) {
    const container = document.getElementById('iframeContainer');
    const iframe = document.getElementById('iframeViewer');
    const sourceViewer = document.getElementById('sourceViewer');
    const viewContentBtn = document.getElementById('viewContentBtn');
    const viewSourceBtn = document.getElementById('viewSourceBtn');
    
    const loadSource = (html) => {
        sourceViewer.innerHTML = "";
        const htmlFileName = path.split('/').pop();
        fetchAndDisplayFile(path, 'html', html);  
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let linkElements = doc.querySelectorAll('link[rel="stylesheet"]');
        let scriptElements = doc.querySelectorAll('script[src]');
        const baseURL = new URL(path, window.location.origin);

        linkElements.forEach(link => {
            const cssPath = link.getAttribute('href');
            if (cssPath) {
                const cssURL = new URL(cssPath, baseURL).href;
                fetchAndDisplayFile(cssURL, 'css');
            }
        });

        scriptElements.forEach(script => {
            const jsPath = script.getAttribute('src');
            if (jsPath) {
                const jsURL = new URL(jsPath, baseURL).href;
                fetchAndDisplayFile(jsURL, 'js');
            }
        });

        sourceViewer.style.display = 'none';
        iframe.style.display = 'block';

        viewContentBtn.classList.remove('bg-gray-600');
        viewContentBtn.classList.add('bg-blue-600');
        viewSourceBtn.classList.remove('bg-blue-600');
        viewSourceBtn.classList.add('bg-gray-600');
    };

    fetch(path)
        .then(response => response.text())
        .then(html => {
            iframe.src = path;
            iframe.style.display = 'block';
            container.style.display = 'block';
            loadSource(html);
        });

    viewContentBtn.addEventListener('click', () => {
        iframe.style.display = 'block';
        sourceViewer.style.display = 'none';

        viewContentBtn.classList.remove('bg-gray-600');
        viewContentBtn.classList.add('bg-blue-600');
        viewSourceBtn.classList.remove('bg-blue-600');
        viewSourceBtn.classList.add('bg-gray-600');
    });

    viewSourceBtn.addEventListener('click', () => {
        iframe.style.display = 'none';
        sourceViewer.style.display = 'block';

        viewContentBtn.classList.remove('bg-blue-600');
        viewContentBtn.classList.add('bg-gray-600');
        viewSourceBtn.classList.remove('bg-gray-600');
        viewSourceBtn.classList.add('bg-blue-600');
    });

    setTimeout(adjustMainContentWidth, 100);
}

const fetchAndDisplayFile = (fileURL, fileType, content = null) => {
    if (!content) {
        fetch(fileURL)
            .then(response => response.text())
            .then(content => {
                displayFileContent(fileURL, fileType, content);
            })
            .catch(error => console.error('Error fetching file:', error));
    } else {
        displayFileContent(fileURL, fileType, content);
    }
};

const displayFileContent = (fileURL, fileType, content) => {
    const language = fileType === 'css' ? 'css' : fileType === 'js' ? 'javascript' : 'markup';
    const fileName = fileURL.split('/').pop();
    
    const fileDivider = `
        <div class="flex justify-between items-center text-white bg-gray-600 px-3 py-1 rounded-lg mt-3 mb-1">
            <span>${fileName}</span>
            <a href="${fileURL}" download="${fileName}" class="flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-r-lg">
                <i class="ti ti-download"></i>  
            </a>
        </div>
    `;
    
    const highlightedCode = Prism.highlight(content.trim(), Prism.languages[language], language);

    sourceViewer.innerHTML += fileDivider + `<pre><code class="language-${language}">${highlightedCode}</code></pre>`;
};


function adjustMainContentWidth() {
    const iframeContainer = document.getElementById('iframeContainer');
    const mainContent = document.getElementById('mainContent');
    const containerWidth = iframeContainer.offsetWidth;
    const windowWidth = window.innerWidth;
    const sidebarWidth = 256;
    const mainWidth = windowWidth - containerWidth - sidebarWidth;
    mainContent.style.maxWidth = `${mainWidth}px`;
    mainContent.style.marginRight = `${containerWidth}px`;
}

document.addEventListener('DOMContentLoaded', () => {
    const iframeContainer = document.getElementById('iframeContainer');
    const mainContent = document.getElementById('mainContent');
    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;
    let startX;
    let startWidth;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.pageX;
        startWidth = iframeContainer.offsetWidth;
        document.body.classList.add('resizing');
        resizeHandle.classList.add('active');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
    
        const maxWidth = window.innerWidth * 0.6;
    
        const width = Math.max(300, Math.min(maxWidth, window.innerWidth - e.pageX));
    
        iframeContainer.style.width = `${width}px`;
        adjustMainContentWidth();
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.classList.remove('resizing');
        resizeHandle.classList.remove('active');
    });

    fetch('exercises.json')
        .then(response => response.json())
        .then(data => generateExerciseLists(data));

        window.addEventListener('resize', () => {
            const iframeContainer = document.getElementById('iframeContainer');
            
            const maxWidth = window.innerWidth * 0.6;

            const currentWidth = iframeContainer.offsetWidth;
        
            if (currentWidth > maxWidth) {
                iframeContainer.style.width = `${maxWidth}px`;
            }
        
            if (iframeContainer.style.display !== 'none') {
                adjustMainContentWidth();
            }
        });
});
