import World from "../terrain/World";
import ContinentalMap from "./ContinentalMap";
import ErosionMap from "./ErosionMap";
import { Noise3DMap } from "./Noise3DMap";
import PVMap from "./PVMap";
import TerrainShapeMap from "./TerrainShapeMap";

export default class DensityMap extends Noise3DMap {
  private readonly SOLID = 1;
  private readonly AIR = -1;
  private readonly NOISE_SCALE = World.DENSITY_NOISE_SCALE;

  private terrainShapeMap: TerrainShapeMap;

  constructor(terrainShapeMap: TerrainShapeMap) {
    super(terrainShapeMap.getSeed());
    this.terrainShapeMap = terrainShapeMap;
  }

  getDensityAt(x: number, y: number, z: number): number {
    const { AIR, SOLID } = this;

    if (y < World.MIN_DENSITY_HEIGHT) {
      return SOLID;
    }

    if (y > World.MAX_DENSITY_HEIGHT) {
      return AIR;
    }

    const scale = this.getScaleFactorAt(x, y, z);
    const squashingFactor = this.getSquashingFactorAt(x, y, z);
    return this.noise3D(x / scale, y / scale, z / scale) + squashingFactor;
  }

  /** Determine the deepness of the cave */
  private getScaleFactorAt(x: number, y: number, z: number): number {
    if (y < World.LARGE_CAVES_HEIGHT) {
      return 256;
    }

    return 32;
  }

  /** Determine the probability of the terrain to be carved out */
  private getSquashingFactorAt(x: number, y: number, z: number): number {
    const continentalness = this.terrainShapeMap.getContinentalnessAt(x, z);
    const erosion = this.terrainShapeMap.getErosionAt(x, z);
    const pv = this.terrainShapeMap.getPVAt(x, z);

    const continentalType = ContinentalMap.getType(continentalness);
    const erosionType = ErosionMap.getType(erosion);
    const isHighPv = pv >= PVMap.NoiseRange["High"][0];

    switch (erosionType) {
      case "VeryLow": {
        return isHighPv ? 0.5 : 0.7;
      }
      case "Low":
        return isHighPv ? 0.6 : 0.8;

      case "Mid":
      case "MidLow":
        return isHighPv ? 0.7 : 0.8;

      case "FlatSpike":
      case "MidSpike":
        return 0.9;

      default:
        // no chance
        return 1;
    }
  }
}
