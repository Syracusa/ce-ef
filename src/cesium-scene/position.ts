import { Cartesian3, Cartographic, Math } from "cesium";
import { CesiumScene } from "./cesium-scene";

export class Position {
    private readonly cesiumScene = CesiumScene.getInstance();
    public cartographicPos: Cartographic = new Cartographic();
    public cartesianPos: Cartesian3 = Cartesian3.fromDegrees(0, 0, 0);
    public degreePos: Array<number> = [0, 0, 0];

    constructor(options: {
        degreePos?: Array<number>,
        cartesianPos?: Cartesian3,
        cartographicPos?: Cartographic
    }) {
        const {
            degreePos,
            cartesianPos,
            cartographicPos
        } = options;

        if (degreePos) {
            this.updateFromDegrees(degreePos);
        } else if (cartesianPos) {
            this.updateFromCartesian3(cartesianPos);
        } else if (cartographicPos) {
            this.updateFromCartographic(cartographicPos);
        }
    }

    public clone() {
        return new Position({
            degreePos: this.degreePos
        });
    }

    public updateFromCartesian3(cartesian3: Cartesian3) {
        this.cartesianPos = cartesian3;
        this.cartographicPos = this.cesiumScene.globe.ellipsoid.cartesianToCartographic(cartesian3);
        this.degreePos = [
            Math.toDegrees(this.cartographicPos.longitude),
            Math.toDegrees(this.cartographicPos.latitude),
            this.cartographicPos.height];
        return this;
    }

    public updateFromCartographic(cartographicPos: Cartographic) {
        this.cartographicPos = cartographicPos;
        this.cartesianPos = this.cesiumScene.globe.ellipsoid.cartographicToCartesian(cartographicPos);
        this.degreePos = [
            Math.toDegrees(cartographicPos.longitude),
            Math.toDegrees(cartographicPos.latitude),
            cartographicPos.height];
        return this;
    }

    public updateFromDegrees(degreePos: Array<number>) {
        this.degreePos = degreePos;
        this.cartesianPos = Cartesian3.fromDegrees(degreePos[0], degreePos[1], degreePos[2]);
        this.cartographicPos = this.cesiumScene.globe.ellipsoid.cartesianToCartographic(this.cartesianPos);
        return this;
    }

    public updateHeight(height: number) {
        this.cartographicPos.height = height;
        this.updateFromCartographic(this.cartographicPos);
        return this;
    }

    public distanceTo(position: Position) {
        return Cartesian3.distance(this.cartesianPos, position.cartesianPos);
    }
}