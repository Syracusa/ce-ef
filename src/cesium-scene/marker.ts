import { Cartesian3, Color, Entity, PinBuilder, VerticalOrigin } from "cesium";
import { CesiumScene } from "./cesium-scene";

export class Marker {
    private static readonly pinBuilder = new PinBuilder();
    private entity: Entity;

    constructor(longitude: number, latitude: number) {
        this.entity = CesiumScene.getInstance().viewer.entities.add({
            name: "Marker",
            position: Cartesian3.fromDegrees(longitude, latitude, 100),
            billboard: {
                image: Marker.pinBuilder.fromText(`${longitude}, ${latitude}`, Color.YELLOW, 100).toDataURL(),
                verticalOrigin: VerticalOrigin.BOTTOM,
            },
        });
    }

    public destroy() {
        CesiumScene.getInstance().viewer.entities.remove(this.entity);
    }
}