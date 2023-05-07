let stories = [];
const loadingMessage = document.querySelector("#loading-message");
const audio = document.querySelector("#audio-player");
const button = document.querySelector("#btn-generate");
const storiesContainer = document.querySelector("#stories");

if (localStorage.getItem("stories")) {
    hideWelcome();
    stories = JSON.parse(localStorage.getItem("stories"));

    storiesContainer.innerHTML = stories
        .map((story) => {
            return `<p>${story}</p>`;
        })
        .join("");
} else {
    storiesContainer.style.display = "none";
}

button.addEventListener("click", () => {
    generateStory();
});

async function generateStory() {
    audio.controls = false;

    button.textContent = "Generating your listenning test...";
    button.setAttribute("disabled", true);
    button.classList.toggle("loading");

    hideWelcome();

    try {
        const api = await fetch("/generate");
        const { data } = await api.json();

        button.removeAttribute("disabled");
        button.classList.toggle("loading");
        button.textContent = "Generate another listenning test";

        setGeneratedStory(data);
    } catch (err) {
        button.classList.toggle("loading");
        button.textContent = "Generate another listenning test";
        button.removeAttribute("disabled");

        loadingMessage.textContent = "Error loading story";
    }
}

function setGeneratedStory(data) {
    audio.src = data.url;
    audio.controls = true;
    loadingMessage.textContent = "";

    if (storiesContainer.style.display === "none") {
        storiesContainer.style.display = "block";
    }

    stories = [data.story, ...stories];

    document.querySelector("#stories").innerHTML = `<p>${data.story}</p>` + document.querySelector("#stories").innerHTML;

    localStorage.setItem("stories", JSON.stringify(stories));
}

function hideWelcome() {
    document.querySelector("#welcome").style.display = "none";
}
