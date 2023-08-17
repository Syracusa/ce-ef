import { Airvehicle, AirvehicleOptions } from "./airvehicle";
import { LinkIndicatorManager } from "./link-indicator-manager";

export class AirvehicleManager {
    /* Singleton */
    private static instance: AirvehicleManager;
    static getInstance() {
        if (!AirvehicleManager.instance)
            AirvehicleManager.instance = new AirvehicleManager();
        return AirvehicleManager.instance;
    }

    private readonly linkIndicatorManager = LinkIndicatorManager.getInstance();
    avList: Airvehicle[] = [];
    
    public addAirvehicle(options : AirvehicleOptions) {
        const airvehicle = new Airvehicle(options);
        this.avList.push(airvehicle);
        for (let i = 0; i < this.avList.length - 1; i++) 
            this.linkIndicatorManager.addLink(airvehicle, this.avList[i]);
    }
}