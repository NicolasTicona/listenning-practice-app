class Injector {
    #container = new Map();

    constructor(providers = []) {
        providers.forEach((provider) => {
            this.#container.set(provider, new provider());
        });
    }

    get(stateClass) {
        const stateInstance = this.#container.get(stateClass);

        if (!stateInstance) {
            this.#container.set(stateClass, new stateClass());
            return this.#container.get(stateClass);
        }

        return stateInstance;
    }
}

export const injector = new Injector();

let stories = [];
const loadingMessage = document.querySelector("#loading-message");
const audio = document.querySelector("#audio-player");
const button = document.querySelector("#btn-generate");
const listenningStoryContainer = document.querySelector("#listenning-story");
const welcomeMessage = document.querySelector("#welcome");
let questions = [];

export class WelcomeState {
    destroy() {
        welcomeMessage.style.display = "none";
        button.removeEventListener("click", this.onClickStart, false);
        button.removeEventListener("click", this.onClickStart, true);
    }

    init() {
        welcomeMessage.style.display = "block";
        button.textContent = "Try out";
        button.addEventListener("click", this.onClickStart);
    }

    onClickStart() {
        const event = new CustomEvent("changeState", {
            detail: { newState: "listenning" },
        });
        document.dispatchEvent(event);
    }
}

export class ListennigState {
    destroy() {
        listenningStoryContainer.style.display = "none";
        button.removeEventListener("click", this.generateStory, false);
        button.removeEventListener("click", this.generateStory, true);
    }

    init() {
        button.textContent = "Generate a story";

        listenningStoryContainer.style.display = "block";

        stories = JSON.parse(localStorage.getItem("stories")) ?? [];

        if (stories.length == 0) {
            this.generateStory();

            button.addEventListener("click", () => {
                this.generateStory();
            });
        } else {
            const story = stories[0];

            audio.src = story.url;
            audio.controls = true;

            renderStoryQuestions(story);

            button.addEventListener("click", () => {
                this.generateStory();
            });
        }
    }

    async generateStory() {
        audio.controls = false;

        button.textContent = "Generating your listenning test...";
        button.setAttribute("disabled", true);
        button.classList.toggle("loading");

        document.querySelector("#welcome").style.display = "none";

        try {
            const api = await fetch("/generate");
            const { data } = await api.json();

            button.removeAttribute("disabled");
            button.classList.toggle("loading");
            button.textContent = "Generate another listenning test";

            this.setGeneratedStory(data);
        } catch (err) {
            button.classList.toggle("loading");
            button.textContent = "Generate another listenning test";
            button.removeAttribute("disabled");

            loadingMessage.textContent = "Error loading story";
        }
    }

    setGeneratedStory(data) {
        audio.src = data.url;
        audio.controls = true;
        loadingMessage.textContent = "";

        if (listenningStoryContainer.style.display === "none") {
            listenningStoryContainer.style.display = "block";
        }

        stories = [data, ...stories];

        renderStoryQuestions(data);

        localStorage.setItem("stories", JSON.stringify(stories));
    }
}

function renderStoryQuestions(story) {
    // listenningStoryContainer.querySelector("#story-container").innerHTML =
    //     story.story;
    listenningStoryContainer.querySelector("#questions-container").innerHTML =
        story.questions;

    questions = listenningStoryContainer.querySelectorAll(
        "#questions-container .question span"
    );

    questions.forEach((question) => {
        question.removeEventListener("click", checkAnswer, false);
        question.removeEventListener("click", checkAnswer, true);
    });

    questions.forEach((question) => {
        question.addEventListener("click", checkAnswer);
    });
}

function checkAnswer(event) {
    if (event.target.id !== "correct") {
        showDialogMessage({ title: "Wrong!", icon: "error" });

        return;
    }

    showDialogMessage({ title: "Correct!", icon: "success" });
}

function showDialogMessage({ title, icon }) {
    Swal.fire({
        title,
        icon,
        backdrop: false,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
    });
}

export class PageState {
    currentState;

    init() {
        this.change(injector.get(WelcomeState));
    }

    change(state) {
        this.currentState?.destroy();
        this.currentState = state;
        this.currentState.init();
    }
}
