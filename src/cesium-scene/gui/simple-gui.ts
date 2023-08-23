import { ScenarioConfig } from "../scenario";

export class SimpleGui {
    private static instance: SimpleGui;

    static getInstance() {
        if (!SimpleGui.instance)
        SimpleGui.instance = new SimpleGui();
        return SimpleGui.instance;
    }

    public scenarioLoadCallback: (scenario: ScenarioConfig) => void;
    public linkViewToggleCallback: () => void;

    constructor() {
        this.init();
    }

    private init() {
        this.makeLoadBtn();
        this.makeLinkViewToggleBtn();
    }

    private makeLoadBtn() {
        const button = document.createElement("button");
        button.style.position = "absolute";
        button.style.top = "45px";
        button.style.right = "10px";
        button.style.width = "100px";
        button.style.height = "20px";
        button.style.zIndex = "1";
        button.style.backgroundColor = "white";
        button.style.color = "black";
        button.style.padding = "0px";
        button.style.cursor = "pointer";
        button.style.fontSize = "9px";
        button.innerHTML = "Load";
        button.addEventListener("click", () => {
            console.log('Load Scene');
            const input = document.createElement('input') as HTMLInputElement;
            input.type = 'file';
            input.onchange = () => {
                const files = Array.from(input.files);
                files[0].text().then(text => {
                    this.scenarioLoadCallback(JSON.parse(text));
                });
            };
            input.click();
            input.remove();
        });
        document.body.appendChild(button);
    }

    private makeLinkViewToggleBtn() {
        const button = document.createElement("button");
        button.style.position = "absolute";
        button.style.top = "70px";
        button.style.right = "10px";
        button.style.width = "100px";
        button.style.height = "20px";
        button.style.zIndex = "1";
        button.style.backgroundColor = "white";
        button.style.color = "black";
        button.style.padding = "0px";
        button.style.cursor = "pointer";
        button.style.fontSize = "9px";
        button.innerHTML = "Link View";
        button.addEventListener("click", () => {
            console.log('Toggle Link View');
            this.linkViewToggleCallback();
        });
        document.body.appendChild(button);
    }
}