
export function setDefaultStyle(element: HTMLElement): void {
    element.style.padding = '1px';
    element.style.margin = '0px';
    element.style.fontSize = '9px';
    element.style.border = '2px solid grey';
    element.style.boxSizing = 'border-box';
}

export function createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    setDefaultStyle(container);
    container.style.position = 'absolute';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    return container;
}

export function createSubContainer(): HTMLDivElement {
    const container = document.createElement('div');
    setDefaultStyle(container);
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    return container;
}

export function createButton(text: string): HTMLButtonElement {
    const button = document.createElement('button');
    setDefaultStyle(button);
    button.style.display = 'block';
    button.style.height = '16px';
    button.style.color = 'white';
    button.style.backgroundColor = "black"
    button.innerHTML = text;
    return button;
}

export function createFlexContainer(): HTMLDivElement {
    const container = document.createElement('div');
    setDefaultStyle(container);
    container.style.display = 'flex';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    return container;
}

export function createSelect(options: HTMLOptionElement[]): HTMLSelectElement {
    const select = document.createElement('select');
    setDefaultStyle(select);
    select.style.display = 'inline-block';
    select.style.height = '20px';
    select.style.color = 'black';

    options.forEach(option => {
        select.appendChild(option);
    });
    return select;
}

export function createLabel(text: string): HTMLLabelElement {
    const label = document.createElement('label');
    setDefaultStyle(label);
    label.style.display = 'inline-block';
    label.style.height = '20px';
    label.style.color = 'black';
    label.innerHTML = text;
    return label;
}