import { Airvehicle, AirvehicleOptions } from "./airvehicle";
import { LinkIndicatorManager } from "./link-indicator-manager";
import { RouteIndicatorManager } from "./route-indicator-manager";

export class AirvehicleManager {
    /* Singleton */
    private static instance: AirvehicleManager;
    static getInstance() {
        if (!AirvehicleManager.instance)
            AirvehicleManager.instance = new AirvehicleManager();
        return AirvehicleManager.instance;
    }

    private readonly linkIndicatorManager = LinkIndicatorManager.getInstance();
    private readonly routeIndicatorManager = RouteIndicatorManager.getInstance();
    avList: Airvehicle[] = [];

    public addAirvehicle(options: AirvehicleOptions) {
        options.index = this.avList.length;
        const airvehicle = new Airvehicle(options);
        this.avList.push(airvehicle);
        for (let i = 0; i < this.avList.length - 1; i++){
            this.linkIndicatorManager.addLink(airvehicle, this.avList[i]);
            this.routeIndicatorManager.addRouteIndicator(airvehicle, this.avList[i]);
            this.routeIndicatorManager.addRouteIndicator(this.avList[i], airvehicle);
        }
    }

    public calcEdgeNodeIdxList(rootNodeIdx: number): number[] {
        const isIdxRelay = new Array(this.avList.length).fill(false);
        const edgeNodeIdxList: number[] = [];
        const node = this.avList[rootNodeIdx];
        for (let i = 0; i < node.routingTable.length; i++) {
            const routeEntry = node.routingTable[i];
            for (let j = 0; j < routeEntry.hopCount - 1; j++) {
                const relayIdx = routeEntry.path[j];
                isIdxRelay[relayIdx] = true;
            }
        }

        for (let i = 0; i < isIdxRelay.length; i++) {
            if (!isIdxRelay[i])
                edgeNodeIdxList.push(i);
        }

        return edgeNodeIdxList;
    }
}