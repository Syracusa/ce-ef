import { Airvehicle, AirvehicleOptions } from "./airvehicle";

export class AirvehicleManager {
    private static instance: AirvehicleManager;

    static getInstance() {
        if (!AirvehicleManager.instance)
            AirvehicleManager.instance = new AirvehicleManager();
        return AirvehicleManager.instance;
    }

    avList: Airvehicle[] = [];
    
    public addAirvehicle(options : AirvehicleOptions) {
        const airvehicle = new Airvehicle(options);
        this.avList.push(airvehicle);
    }
}