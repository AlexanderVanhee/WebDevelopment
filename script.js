const generateExerciseLists = (data) => {
  const container = document.getElementById("exercises-container");
  const sidebarNav = document.getElementById("sidebarNav");

  data.tasks.forEach((task, taskIndex) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "mb-8";
    taskDiv.id = `task-${taskIndex}`;
    taskDiv.innerHTML = `<h2 class="text-2xl font-semibold">${task.title}</h2><p>${task.subtitle}</p><br>`;

    const accordion = document.createElement("div");
    accordion.className = "space-y-4";

    const taskItem = document.createElement("li");
    taskItem.innerHTML = `
          <a href="#task-${taskIndex}" 
              class="text-white hover:bg-gray-700 hover:text-blue-500 transition-all duration-300 px-4 py-2 rounded-md bg-transparent w-full block">
              ${task.title}
          </a>`;
    sidebarNav.appendChild(taskItem);

    task.exercises.forEach((exercise) => {
      const card = document.createElement("div");
      card.className = "bg-neutral-900 rounded-lg shadow-md p-4";

      // Create card content without inline onClick
      card.innerHTML = `
                  <div class="flex items-center justify-between w-full">
                      <p class="text-left text-lg font-semibold">
                          ${exercise.title}
                      </p>
                      <div class="flex items-center space-x-2">
                          <a aria-label="Open external link to exercise" role="button" href="${exercise.path}" class="flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-full">
                              <i class="ti ti-external-link"></i>
                          </a>
  
                          <button aria-label="Open exercise in embedded view" class="embedded-view-btn flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-full hidden sm:block" data-path="${exercise.path}">
                              <i class="ti ti-arrow-right"></i>
                          </button>
                      </div>
                  </div>
                  ${exercise.note
          ? `
                      <p class="text-blue-600 flex items-center font-bold">
                          <span class="font-bold"><i class="ti ti-arrow-right mr-2 align-middle"></i>${exercise.note}</span>
                      </p>
                  `
          : ""
        }
              `;

      accordion.appendChild(card);
    });

    taskDiv.appendChild(accordion);
    container.appendChild(taskDiv);
  });

  // Add event listeners after DOM is populated
  document.querySelectorAll('.embedded-view-btn').forEach(button => {
    button.addEventListener('click', function () {
      const path = this.getAttribute('data-path');
      loadIframe(path);
    });
  });
}

const loadIframe = (path) => {
  const container = document.getElementById("iframeContainer");
  const iframe = document.getElementById("iframeViewer");
  const sourceViewer = document.getElementById("sourceViewer");
  const viewContentBtn = document.getElementById("viewContentBtn");
  const viewSourceBtn = document.getElementById("viewSourceBtn");

  // Calculate base URL for the current path
  const getBaseUrl = (url) => {
    return url.substring(0, url.lastIndexOf("/") + 1);
  };

  const currentBaseUrl = getBaseUrl(window.location.href);
  const resourceBaseUrl = getBaseUrl(currentBaseUrl + path);

  const loadSource = (html) => {
    sourceViewer.innerHTML = "";
    fetchAndDisplayFile(path, "html", html);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Handle stylesheets
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const cssPath = link.getAttribute("href");
      if (cssPath) {
        try {
          const cssUrl = new URL(cssPath, resourceBaseUrl).href;
          fetchAndDisplayFile(cssUrl, "css");
        } catch (error) {
          console.error("Error resolving CSS URL:", error);
        }
      }
    });

    // Handle scripts - Fixed JS file loading
    doc.querySelectorAll("script[src]").forEach((script) => {
      const jsPath = script.getAttribute("src");
      if (jsPath) {
        try {
          // Use resourceBaseUrl to resolve the JavaScript file path
          const jsUrl = new URL(jsPath, resourceBaseUrl).href;
          fetchAndDisplayFile(jsUrl, "js");
        } catch (error) {
          console.error("Error resolving JS URL:", error);
        }
      }
    });

    sourceViewer.style.display = "none";
    iframe.style.display = "block";

    viewContentBtn.classList.remove("bg-gray-600");
    viewContentBtn.classList.add("bg-blue-600");
    viewSourceBtn.classList.remove("bg-blue-600");
    viewSourceBtn.classList.add("bg-gray-600");
  };

  fetch(path)
    .then((response) => response.text())
    .then((html) => {
      iframe.src = path;
      iframe.style.display = "block";
      container.style.display = "block";
      loadSource(html);
    })
    .catch((error) => {
      console.error("Error loading iframe content:", error);
      container.innerHTML = `<p class="text-red-500">Error loading content: ${error.message}</p>`;
    });

  const toggleView = (showContent) => {
    iframe.style.display = showContent ? "block" : "none";
    sourceViewer.style.display = showContent ? "none" : "block";

    viewContentBtn.classList.toggle("bg-blue-600", showContent);
    viewContentBtn.classList.toggle("bg-gray-600", !showContent);
    viewSourceBtn.classList.toggle("bg-blue-600", !showContent);
    viewSourceBtn.classList.toggle("bg-gray-600", showContent);
  };

  // Remove existing event listeners to prevent duplicates
  viewContentBtn.removeEventListener("click", () => toggleView(true));
  viewSourceBtn.removeEventListener("click", () => toggleView(false));

  // Add event listeners properly
  viewContentBtn.addEventListener("click", () => toggleView(true));
  viewSourceBtn.addEventListener("click", () => toggleView(false));

  setTimeout(adjustMainContentWidth, 300);
}

const fetchAndDisplayFile = (fileURL, fileType, content = null) => {
  const fetchFile = content
    ? Promise.resolve(content)
    : fetch(fileURL).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    });

  fetchFile
    .then((fileContent) => {
      displayFileContent(fileURL, fileType, fileContent);
    })
    .catch((error) => {
      console.error(`Error fetching ${fileType} file:`, error);
      const sourceViewer = document.getElementById("sourceViewer");
      sourceViewer.innerHTML += `
          <div class="text-red-500 my-2">
            Error loading ${fileURL}: ${error.message}
          </div>`;
    });
};

const displayFileContent = (fileURL, fileType, content) => {
  const sourceViewer = document.getElementById("sourceViewer");
  const language =
    {
      css: "css",
      js: "javascript",
      html: "markup",
    }[fileType] || "markup";

  const fileName = fileURL.split("/").pop();

  const fileDivider = `
      <div class="flex justify-between items-center text-white bg-gray-600 px-3 py-1 rounded-lg mt-3 mb-1">
        <span>${fileName}</span>
        <a href="${fileURL}" download="${fileName}" class="flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-r-lg">
          <i class="ti ti-download"></i>  
        </a>
      </div>
    `;

  const highlightedCode = Prism.highlight(
    content.trim(),
    Prism.languages[language],
    language
  );

  sourceViewer.innerHTML += `
      ${fileDivider}
      <pre><code class="language-${language}" style="text-wrap:auto;">${highlightedCode}</code></pre>
    `;
};

const adjustMainContentWidth = () => {
  const iframeContainer = document.getElementById("iframeContainer");
  const mainContent = document.getElementById("mainContent");
  const containerWidth = iframeContainer.offsetWidth;
  const windowWidth = window.innerWidth;
  const sidebarWidth = 256;
  const mainWidth = windowWidth - containerWidth - sidebarWidth;

  mainContent.style.maxWidth = `${mainWidth}px`;
  mainContent.style.marginRight = `${containerWidth}px`;
}

document.addEventListener("DOMContentLoaded", () => {
  const iframeContainer = document.getElementById("iframeContainer");
  const resizeHandle = document.querySelector(".resize-handle");
  let isResizing = false;

  const handleResize = (e) => {
    if (!isResizing) return;

    const maxWidth = window.innerWidth * 0.6;
    const width = Math.max(
      300,
      Math.min(maxWidth, window.innerWidth - e.pageX)
    );

    iframeContainer.style.width = `${width}px`;
    adjustMainContentWidth();
  };

  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    document.body.classList.add("resizing");
    resizeHandle.classList.add("active");
    document.getElementById("resize-overlay").style.display = "block";
  });

  document
    .getElementById("resize-overlay")
    .addEventListener("mousemove", handleResize);

  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.body.classList.remove("resizing");
    resizeHandle.classList.remove("active");
    document.getElementById("resize-overlay").style.display = "none";
  });

  fetch("exercises.json")
    .then((response) => response.json())
    .then((data) => generateExerciseLists(data))
    .catch((error) => {
      console.error("Error loading exercises:", error);
      document.getElementById("exercises-container").innerHTML = `
          <div class="text-red-500">
            Error loading exercises: ${error.message}
          </div>`;
    });

  window.addEventListener("resize", () => {
    const maxWidth = window.innerWidth * 0.6;
    const currentWidth = iframeContainer.offsetWidth;

    if (currentWidth > maxWidth) {
      iframeContainer.style.width = `${maxWidth}px`;
    }

    if (iframeContainer.style.display !== "none") {
      adjustMainContentWidth();
    }
  });
});