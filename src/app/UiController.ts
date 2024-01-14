export class UiController {
    // Buttons
    startButton: HTMLElement;
    restartButton: HTMLElement;
    startOverButton: HTMLElement;
    // UI containers
    startScreen: HTMLElement;
    loseScreen: HTMLElement;
    winScreen: HTMLElement;
    gameStatusPanel: HTMLElement;
    // Other
    timeLeftValue: HTMLElement;
    keysFoundValue: HTMLElement;
    canvas: HTMLCanvasElement;
    private static instance: UiController;

    constructor() {
        this.startButton = document.getElementById("start-button");
        this.restartButton = document.getElementById("restart-button");
        this.startOverButton = document.getElementById("start-over-button");

        this.startScreen = document.getElementById("start-screen");
        this.loseScreen = document.getElementById("lose-screen");
        this.winScreen = document.getElementById("win-screen");
        this.gameStatusPanel = document.getElementById("game-status-panel");

        this.timeLeftValue = document.getElementById("time-left-value");
        this.keysFoundValue = document.getElementById("keys-found-value");

        this.canvas = document.querySelector('canvas');
    }

    static create(): UiController {
        if (!UiController.instance) {
            UiController.instance = new UiController();
        }
        return UiController.instance;
    }

    showStartScreen() {
        this.setIsVisible(this.startScreen, true);
        this.setIsVisible(this.loseScreen, false);
        this.setIsVisible(this.winScreen, false);
        this.setIsVisible(this.gameStatusPanel, false);
        this.setIsVisible(this.canvas, false);
    }

    showLoseScreen() {
        this.setIsVisible(this.startScreen, false);
        this.setIsVisible(this.loseScreen, true);
        this.setIsVisible(this.winScreen, false);
        this.setIsVisible(this.gameStatusPanel, false);
        this.setIsVisible(this.canvas, false);
    }

    showWinScreen() {
        this.setIsVisible(this.startScreen, false);
        this.setIsVisible(this.loseScreen, false);
        this.setIsVisible(this.winScreen, true);
        this.setIsVisible(this.gameStatusPanel, false);
        this.setIsVisible(this.canvas, false);
    }

    showGameScreen() {
        this.setIsVisible(this.startScreen, false);
        this.setIsVisible(this.loseScreen, false);
        this.setIsVisible(this.winScreen, false);
        this.setIsVisible(this.gameStatusPanel, true);
        this.setIsVisible(this.canvas, true);
    }

    setTimeLeft(seconds: number) {
        console.log(seconds)
        this.timeLeftValue.innerText = `${seconds}s`;
    }

    setKeysFound(options: {
        foundKeys: number;
        totalKeys: number
    }) {
        this.keysFoundValue.innerText = `${options.foundKeys} / ${options.totalKeys}`
    }

    setIsStartScreenLoading(isLoading: boolean) {
        if (isLoading) {
            this.startButton.innerText = "Loading...";
            this.startButton.setAttribute("disabled", "");
        } else {
            this.startButton.innerText = "Start";
            this.startButton.removeAttribute("disabled");
        }
    }

    private setIsVisible(element: HTMLElement, isVisible: boolean) {
        element.style.display = isVisible ? "flex" : "none";
    }
}
