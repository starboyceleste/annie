document.addEventListener("DOMContentLoaded", () => {
    const sections = ["in-progress", "finished", "on-hold", "dropped", "planned", "suggested"];
    let currentIndex = 0;

    function showSection(index) {
        sections.forEach((section, i) => {
            const sectionElement = document.getElementById(section);
            sectionElement.classList.toggle('active', i === index);

            const link = document.querySelector(`nav a[data-section="${section}"]`);
            if (i === index) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        document.getElementById('section-title').textContent = sections[index].replace("-", " ").toUpperCase() + ".";
    }

    document.getElementById('left-arrow').addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? sections.length - 1 : currentIndex - 1;
        showSection(currentIndex);
    });

    document.getElementById('right-arrow').addEventListener('click', () => {
        currentIndex = (currentIndex === sections.length - 1) ? 0 : currentIndex + 1;
        showSection(currentIndex);
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            const section = this.getAttribute('data-section');
            if (section) {
                e.preventDefault();
                currentIndex = sections.indexOf(section);
                showSection(currentIndex);
            } 
        });
    });

    showSection(currentIndex);

    async function fetchGoogleSheetData() {
        const url = "https://script.google.com/macros/s/AKfycbz4IOU3RZlRt2ixbo7Cy4RqaMBrQ1DyIDGzn9krMlc1USpGZwgW-4bkLuZk5z-hCuD9/exec";
    
        const loadingMessage = document.getElementById("loading-message");
        const lastUpdatedElement = document.getElementById("last-updated");

        loadingMessage.style.display = "block";
    
        try {
            const response = await fetch(url);
            const data = await response.json();

            const lastUpdated = data.find(row => row[0] === "lastUpdated")[1];
            lastUpdatedElement.textContent = `Last updated: ${new Date(lastUpdated).toLocaleString()}`;
    
            function updateDisplay() {
                const statusContainers = {
                    "in-progress": document.getElementById("in-progress"),
                    "finished": document.getElementById("finished"),
                    "on-hold": document.getElementById("on-hold"),
                    "dropped": document.getElementById("dropped"),
                    "planned": document.getElementById("planned"),
                    "suggested": document.getElementById("suggested")
                };
    
                for (let key in statusContainers) {
                    if (key === "finished") {
                        const note = statusContainers[key].querySelector("p");
                        statusContainers[key].innerHTML = "";
                        statusContainers[key].appendChild(note);
                    } else {
                        statusContainers[key].innerHTML = "";
                    }
                }
    
                const isChecked = document.getElementById("toggle").checked;
    
                data.forEach((row, index) => {
                    const [status, game, hoursPlayed, hoursToComplete, chapter, chaptersToComplete, progressUnit, lastPlayedDate, note, ...genres] = row;
                    const statusKey = status.toLowerCase().replace(" ", "-");
    
                    if (statusContainers[statusKey]) {
                        const gameContainer = document.createElement("div");
                        gameContainer.className = "game-container";
                        gameContainer.style.setProperty('--animation-order', index);
    
                        const titleElement = document.createElement("h3");
                        titleElement.textContent = game;
                        gameContainer.appendChild(titleElement);
    
                        const genreContainer = document.createElement("div");
                        genreContainer.className = "genre-container";
                        genres.forEach(genre => {
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
                            progressText = `${chapter}/${chaptersToComplete} ${progressUnit} (${progressPercentage.toFixed(1)}%)`;
                        } else {
                            progressPercentage = (hoursPlayed / hoursToComplete) * 100;
                            progressText = `${hoursPlayed}/${hoursToComplete} Hours (${progressPercentage.toFixed(1)}%)`;
                        }
    
                        progressFill.style.width = `${progressPercentage}%`;
                        progressContainer.appendChild(progressFill);
                        gameContainer.appendChild(progressContainer);
    
                        if (lastPlayedDate) {
                            const dateObj = new Date(lastPlayedDate);
                            const currentDate = new Date();
                            const formattedDate = `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
                            const label = dateObj > currentDate ? "Planned for" : "Last Played";
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
    
                        statusContainers[statusKey].appendChild(gameContainer);
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
            document.getElementById("toggle").addEventListener("change", updateDisplay);
    
        } catch (error) {
            console.error("Error fetching data:", error);
            loadingMessage.textContent = "sorry, it broke. womp.";
        }
    }

    fetchGoogleSheetData();
});
