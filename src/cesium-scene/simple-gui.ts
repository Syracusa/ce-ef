
export class SimpleGui {
    private static instance: SimpleGui;

    static getInstance() {
        if (!SimpleGui.instance)
        SimpleGui.instance = new SimpleGui();
        return SimpleGui.instance;
    }

    constructor() {
        this.init();
    }

    private init() {
        const button = document.createElement("button");
        button.style.position = "absolute";
        button.style.top = "10px";
        button.style.left = "10px";
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
                    console.log(text);
                });
            };
            input.click();
            input.remove();
        });
        document.body.appendChild(button);
    }
}