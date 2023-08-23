import {
    createButton, createContainer,
    createFlexContainer, createLabel,
    createSelect, createSubContainer
} from "./elem-util";

export class TrafficController {
    /* Singleton */
    private static instance: TrafficController;
    static getInstance() {
        if (!TrafficController.instance)
            TrafficController.instance = new TrafficController();
        return TrafficController.instance;
    }

    createCallback = (trafficConfId: number) => { console.log('No create callback', trafficConfId); };
    startCallback = (trafficConfId: number, sender: number, receiver: number, packetSize: number, intervalMs: number) => {
        console.log('No start callback', trafficConfId, sender, receiver, packetSize, intervalMs);
    };
    stopCallback = (trafficConfId: number) => { console.log('No stop callback', trafficConfId); };
    updateCallback = (trafficConfId: number, sender: number, receiver: number, packetSize: number, intervalMs: number) => {
        console.log('No update callback', trafficConfId, sender, receiver, packetSize, intervalMs);
    };
    deleteCallback = (trafficConfId: number) => { console.log('No delete callback', trafficConfId); };

    private trafficConfIdCounter = 0;

    static readonly SUB_CONTROLLER_ID_BASE = 'traffic_controller_sub_controller_';
    static readonly SENDER_ID_BASE = 'traffic_controller_sender_';
    static readonly RECEIVER_ID_BASE = 'traffic_controller_receiver_';
    static readonly PACKET_SIZE_ID_BASE = 'traffic_controller_packetSize_';
    static readonly INTERVAL_ID_BASE = 'traffic_controller_interval_';

    constructor() {
        const container = createContainer();
        container.style.display = 'flex';
        container.style.border = 'none';
        container.style.transition = "left 1.5s";
        container.style.backgroundColor = 'transparent';

        const controllerContainer = this.createControllerBody();
        container.appendChild(controllerContainer);
        document.body.appendChild(container);

        const sideViewToggle = createButton('Traffic Control');
        sideViewToggle.style.writingMode = 'vertical-rl';
        sideViewToggle.style.backgroundColor = 'grey';
        sideViewToggle.style.color = 'white';
        sideViewToggle.style.fontSize = '15px';
        sideViewToggle.style.fontWeight = 'bold';
        sideViewToggle.style.width = '20px';
        sideViewToggle.style.height = '150px';
        sideViewToggle.style.border = '1px solid DarkGrey';
        sideViewToggle.onclick = () => {
            container.style.left = container.style.left === '0px' ? '-237px' : '0px';
        }

        container.appendChild(sideViewToggle);
        container.style.left = '-237px'; /* Hidden at first */
    }

    private createControllerBody(): HTMLDivElement {
        const controllerContainer = createSubContainer();
        controllerContainer.style.minWidth = '236px';
        
        const subControllerContainer = createSubContainer();
        subControllerContainer.appendChild(this.createSubTrafficController());
        subControllerContainer.appendChild(this.createSubTrafficController());

        const newTrafficButton = createButton(" + New Traffic ");
        newTrafficButton.style.width = "100%";
        newTrafficButton.onclick = () => {
            subControllerContainer.appendChild(this.createSubTrafficController());
        }

        controllerContainer.appendChild(subControllerContainer);
        controllerContainer.appendChild(newTrafficButton);

        return controllerContainer;
    }

    private createSubTrafficController(): HTMLDivElement {
        this.trafficConfIdCounter++;
        this.createCallback(this.trafficConfIdCounter);

        const container = createSubContainer();
        container.id = TrafficController.SUB_CONTROLLER_ID_BASE + this.trafficConfIdCounter.toString();
        container.style.border = '2px solid GhostWhite';
        container.style.borderBottom = 'none';

        const senderReceiverContainer = this.createSenderReceiverSelectContainer();
        container.appendChild(senderReceiverContainer);

        const trafficTraitContainer = this.createTrafficTraitSelectContainer();
        container.appendChild(trafficTraitContainer);

        const buttonContainer = this.createOneControllerButtonDiv();
        container.appendChild(buttonContainer);
        return container;
    }

    private getSelectedValueById(id: string): number {
        const select = document.getElementById(id) as HTMLSelectElement;
        return parseInt(select.options[select.selectedIndex].value);
    }

    private getSelectedSender(trafficConfId: number): number {
        const selectId = TrafficController.SENDER_ID_BASE + trafficConfId.toString();
        return this.getSelectedValueById(selectId);
    }

    private getSelectedReceiver(trafficConfId: number): number {
        const selectId = TrafficController.RECEIVER_ID_BASE + trafficConfId.toString();
        return this.getSelectedValueById(selectId);
    }

    private getSelectedPacketSize(trafficConfId: number): number {
        const selectId = TrafficController.PACKET_SIZE_ID_BASE + trafficConfId.toString();
        return this.getSelectedValueById(selectId);
    }

    private getSelectedInterval(trafficConfId: number): number {
        const selectId = TrafficController.INTERVAL_ID_BASE + trafficConfId.toString();
        return this.getSelectedValueById(selectId);
    }

    private createTrafficTraitSelectContainer(): HTMLDivElement {
        const container = createFlexContainer();
        container.style.width = '100%';

        const packetSizeOptions: HTMLOptionElement[] = [];
        for (let i = 100; i < 1600; i += 100) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.innerHTML = i.toString();
            packetSizeOptions.push(option);
        }
        const packetSizeSelector = this.createSelector(
            'Packet Size', packetSizeOptions,
            TrafficController.PACKET_SIZE_ID_BASE, 9);
        packetSizeSelector.style.width = '50%';
        container.appendChild(packetSizeSelector);

        const intervalOptions: HTMLOptionElement[] = [];
        for (let i = 1; i < 5; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.innerHTML = i.toString();
            intervalOptions.push(option);
        }
        for (let i = 5; i < 100; i += 5) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.innerHTML = i.toString();
            intervalOptions.push(option);
        }
        for (let i = 100; i <= 1000; i += 100) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.innerHTML = i.toString();
            intervalOptions.push(option);
        }

        const intervalSelector = this.createSelector(
            'Interval(ms)', intervalOptions,
            TrafficController.INTERVAL_ID_BASE, 23);
        intervalSelector.style.width = '50%';
        container.appendChild(intervalSelector);

        return container;
    }

    private createSenderReceiverSelectContainer(): HTMLDivElement {
        const container = createFlexContainer();
        container.style.width = '100%';

        const senderOptions: HTMLOptionElement[] = [];
        for (let i = 0; i < 10; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.innerHTML = i.toString();
            senderOptions.push(option);
        }
        const senderSelector = this.createSelector(
            'Sender', senderOptions,
            TrafficController.SENDER_ID_BASE, 0);
        senderSelector.style.width = '50%';
        container.appendChild(senderSelector);

        const receiverOptions: HTMLOptionElement[] = [];
        for (let i = 0; i < 10; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.innerHTML = i.toString();
            receiverOptions.push(option);
        }
        const receiverSelector = this.createSelector(
            'Receiver', receiverOptions,
            TrafficController.RECEIVER_ID_BASE, 1);
        receiverSelector.style.width = '50%';
        container.appendChild(receiverSelector);

        return container;
    }

    private createOneControllerButtonDiv(): HTMLDivElement {
        const buttonContainer = createFlexContainer();
        const trafficConfId = this.trafficConfIdCounter;

        const startStopButton = createButton('Start');
        startStopButton.style.width = '33.4%';
        startStopButton.onclick = () => {
            if (startStopButton.innerHTML === 'Start') {
                this.startCallback(this.trafficConfIdCounter,
                    this.getSelectedSender(trafficConfId),
                    this.getSelectedReceiver(trafficConfId),
                    this.getSelectedPacketSize(trafficConfId),
                    this.getSelectedInterval(trafficConfId)
                );

                startStopButton.innerHTML = 'Stop';
                startStopButton.style.backgroundColor = 'red';
            } else {
                this.stopCallback(this.trafficConfIdCounter);

                startStopButton.innerHTML = 'Start';
                startStopButton.style.backgroundColor = 'black';
            }
        }

        const updateButton = createButton('Update');
        updateButton.style.width = '33.3%';
        updateButton.onclick = () => {
            this.updateCallback(this.trafficConfIdCounter,
                this.getSelectedSender(trafficConfId),
                this.getSelectedReceiver(trafficConfId),
                this.getSelectedPacketSize(trafficConfId),
                this.getSelectedInterval(trafficConfId)
            );
        }

        const deleteButton = createButton('Delete');
        deleteButton.style.width = '33.3%';
        deleteButton.onclick = () => {
            this.deleteCallback(this.trafficConfIdCounter);
            const container = document.getElementById(TrafficController.SUB_CONTROLLER_ID_BASE + trafficConfId.toString());
            container.parentNode.removeChild(container);
        }

        buttonContainer.appendChild(startStopButton);
        buttonContainer.appendChild(updateButton);
        buttonContainer.appendChild(deleteButton);

        return buttonContainer;
    }

    private createSelector(text: string, options: HTMLOptionElement[], selectIdBase: string, defaultIdx = 0): HTMLDivElement {
        const container = createFlexContainer();
        container.style.width = '100%';
        const label = createLabel(text);
        label.style.width = '50px';
        label.style.borderRight = 'none';

        container.appendChild(label);
        const select = createSelect(options);
        select.style.width = '50px';
        select.style.borderLeft = 'none';
        select.style.backgroundColor = 'grey';
        select.selectedIndex = defaultIdx;

        select.id = selectIdBase + this.trafficConfIdCounter.toString();

        container.appendChild(select);
        return container;
    }
}