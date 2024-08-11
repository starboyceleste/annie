document.addEventListener("DOMContentLoaded", () => {
  const sections = {
    progress: "IN-PROGRESS.",
    finished: "FINISHED.",
    hold: "ON-HOLD.",
    dropped: "DROPPED.",
    planned: "PLANNED.",
    suggested: "SUGGESTED.",
  };
  let currentIndex = 0;

  function showSection(index) {
    const sectionKeys = Object.keys(sections);
    const section = sectionKeys[index];
    const sectionTitle = sections[section];

    Object.keys(sections).forEach((key, i) => {
      const sectionElement = document.getElementById(key);
      sectionElement.classList.toggle("active", i === index);

      const link = document.querySelector(`nav a[data-section="${key}"]`);
      if (i === index) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    document.getElementById("section-title").textContent = sectionTitle;
  }

  document.getElementById("left-arrow").addEventListener("click", () => {
    currentIndex =
      currentIndex === 0 ? Object.keys(sections).length - 1 : currentIndex - 1;
    showSection(currentIndex);
  });

  document.getElementById("right-arrow").addEventListener("click", () => {
    currentIndex =
      currentIndex === Object.keys(sections).length - 1 ? 0 : currentIndex + 1;
    showSection(currentIndex);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      currentIndex =
        currentIndex === 0
          ? Object.keys(sections).length - 1
          : currentIndex - 1;
      showSection(currentIndex);
    }
    if (event.key === "ArrowRight") {
      currentIndex =
        currentIndex === Object.keys(sections).length - 1
          ? 0
          : currentIndex + 1;
      showSection(currentIndex);
    }
  });

  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", function (e) {
      const section = this.getAttribute("data-section");
      if (section) {
        e.preventDefault();
        currentIndex = Object.keys(sections).indexOf(section);
        showSection(currentIndex);
      }
    });
  });

  showSection(currentIndex);

  async function fetchData() {
    const url =
      "https://script.google.com/macros/s/AKfycbyJmjCPrvwbUmx-DJAsxOI9wgXUGN8GjSJsK0NBQquRVJc88cu1tAvukB1z7aaF61Kb/exec";

    const loadingMessage = document.getElementById("loading-message");
    const lastUpdatedElement = document.querySelector("#lastmod > span");

    loadingMessage.style.display = "block";

    try {
      const response = await fetch(url);
      const data = await response.json();

      const lastUpdated = data.find((row) => row[0] === "lastUpdated")[1];
      lastUpdatedElement.textContent = `${new Date(
        lastUpdated
      ).toLocaleString()}`;

      function updateDisplay() {
        const statusContainers = {
          progress: document.getElementById("progress"),
          finished: document.getElementById("finished"),
          hold: document.getElementById("hold"),
          dropped: document.getElementById("dropped"),
          planned: document.getElementById("planned"),
          suggested: document.getElementById("suggested"),
        };

        for (let key in statusContainers) {
          const container = statusContainers[key];

          const sectionElements = Array.from(container.children).filter(
            (child) => !child.classList.contains("game-container")
          );

          container.innerHTML = "";
          sectionElements.forEach((element) => container.appendChild(element));
        }

        const isChecked = document.getElementById("toggle").checked;

        data.forEach((row, index) => {
          const [
            status,
            game,
            hoursPlayed,
            hoursToComplete,
            chapter,
            chaptersToComplete,
            progressUnit,
            lastPlayedDate,
            note,
            ...genres
          ] = row;

          if (statusContainers[status]) {
            const gameContainer = document.createElement("div");
            gameContainer.className = "game-container";
            gameContainer.style.setProperty("--animation-order", index);

            const titleElement = document.createElement("h3");
            titleElement.textContent = game;
            gameContainer.appendChild(titleElement);

            const genreContainer = document.createElement("div");
            genreContainer.className = "genre-container";
            genres.forEach((genre) => {
              if (genre) {
                const genreTag = document.createElement("span");
                genreTag.className = "genre-tag";
                genreTag.textContent = genre;
                genreContainer.appendChild(genreTag);
              }
            });
            gameContainer.appendChild(genreContainer);

            const progressContainer = document.createElement("div");
            progressContainer.className = "progress-container";

            const progressFill = document.createElement("div");
            progressFill.className = "progress-fill";

            let progressPercentage;
            let progressText = "";

            if (isChecked) {
              progressPercentage = (chapter / chaptersToComplete) * 100;
              progressText = `${chapter}/${chaptersToComplete} ${progressUnit} (${progressPercentage.toFixed(
                1
              )}%)`;
            } else {
              progressPercentage = (hoursPlayed / hoursToComplete) * 100;
              progressText = `${hoursPlayed}/${hoursToComplete} Hours (${progressPercentage.toFixed(
                1
              )}%)`;
            }

            progressFill.style.width = `${progressPercentage}%`;
            progressContainer.appendChild(progressFill);
            gameContainer.appendChild(progressContainer);

            if (lastPlayedDate) {
              const dateObj = new Date(lastPlayedDate);
              const currentDate = new Date();
              const formattedDate = `${dateObj.toLocaleString("default", {
                month: "long",
              })} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
              const label =
                dateObj > currentDate ? "Planned for" : "Last Played";
              progressText += ` - ${label}: ${formattedDate}`;
            }

            const progressTextElement = document.createElement("span");
            progressTextElement.textContent = progressText;
            gameContainer.appendChild(progressTextElement);

            if (note) {
              const noteElement = document.createElement("p");
              noteElement.textContent = note;
              gameContainer.appendChild(noteElement);
            }

            statusContainers[status].appendChild(gameContainer);
          }
        });

        for (let key in statusContainers) {
          if (!statusContainers[key].children.length) {
            const noGamesMessage = document.createElement("p");
            noGamesMessage.textContent = "no games found!";
            statusContainers[key].appendChild(noGamesMessage);
          }
        }

        loadingMessage.style.display = "none";
      }

      updateDisplay();
      document
        .getElementById("toggle")
        .addEventListener("change", updateDisplay);
    } catch (error) {
      console.error("Error fetching data:", error);
      loadingMessage.textContent = "sorry, it broke. womp.";
    }
  }

  fetchData();
});
