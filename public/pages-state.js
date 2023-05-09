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
const storiesContainer = document.querySelector("#stories");
const welcomeMessage = document.querySelector("#welcome");

export class WelcomeState {
    destroy() {
        welcomeMessage.style.display = "none";
        button.removeEventListener('click', this.onClickStart, false);
        button.removeEventListener('click', this.onClickStart, true);
    }

    init() {
        welcomeMessage.style.display = "block";
        button.textContent = "Explore and practice";
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
        storiesContainer.style.display = "none";
        button.addEventListener("click", () => {});
    }

    init() {
        button.textContent = "Generate a story";

        storiesContainer.style.display = "block";

        stories = JSON.parse(localStorage.getItem("stories")) ?? [];

        storiesContainer.innerHTML = stories
            .map((story) => {
                return `<p>${story}</p>`;
            })
            .join("");

        button.addEventListener("click", () => {
          this.generateStory();
        });
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

        if (storiesContainer.style.display === "none") {
            storiesContainer.style.display = "block";
        }

        stories = [data.story, ...stories];

        document.querySelector("#stories").innerHTML =
            `<p>${data.story}</p>` +
            document.querySelector("#stories").innerHTML;

        localStorage.setItem("stories", JSON.stringify(stories));
    }
}

export class PageState {
    currentState;

    constructor() {}

    init() {
        this.change(injector.get(WelcomeState));
    }

    change(state) {
        this.currentState?.destroy();
        this.currentState = state;
        this.currentState.init();
    }
}
