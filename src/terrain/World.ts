import EnvVars from "../config/EnvVars";
import { Coordinate } from "../utils/helpers";
import { Chunk, ChunkID } from "./chunk";

export default class World {
  static readonly CONTINENTALNESS_NOISE_SCALE = 2000;
  static readonly EROSION_NOISE_SCALE = 1024;
  static readonly PV_BASE_SCALE = 180;

  static readonly MAX_WORLD_HEIGHT =
    EnvVars.TOP_RENDER_DISTANCE_IN_CHUNKS * Chunk.HEIGHT;
  static readonly MIN_WORLD_HEIGHT =
    EnvVars.BOTTOM_RENDER_DISTANCE_IN_CHUNKS * -Chunk.HEIGHT;

  static readonly MIN_EROSION = 0;
  static readonly MAX_EROSION = 45;

  static readonly CONTINENTALNESS_MIN_HEIGHT = 0;
  static readonly CONTINENTALNESS_MAX_HEIGHT =
    this.CONTINENTALNESS_MIN_HEIGHT + 50;

  // WARN must be less than MAX_WORLD_HEIGHT
  static readonly MAX_SURFACE_HEIGHT =
    this.CONTINENTALNESS_MAX_HEIGHT + this.MAX_EROSION;
  // WARN must be greater than MIN_WORLD_HEIGHT
  static readonly MIN_SURFACE_HEIGHT =
    this.CONTINENTALNESS_MIN_HEIGHT - this.MAX_EROSION;

  static readonly SEA_LEVEL = this.CONTINENTALNESS_MIN_HEIGHT + 10;
  static readonly CLOUD_LEVEL = this.MAX_SURFACE_HEIGHT - 10;

  /**
   * Return the chunkID of the chunk that is supposed to contain the specified position
   *
   * e.g. if we ask for the coordinates (35,0,0) which is located in the chunk with id (1,0,0)
   * its corresponding chunk id will be "1,0,0".
   */
  static getChunkIdFromPosition({ x, y, z }: Coordinate): ChunkID {
    const chunkX = Math.floor(x / Chunk.WIDTH);
    const chunkY = Math.floor(y / Chunk.HEIGHT);
    const chunkZ = Math.floor(z / Chunk.WIDTH);

    return Chunk.buildChunkId({
      x: chunkX,
      y: chunkY,
      z: chunkZ,
    });
  }

  /**
   * Compute the chunk origin position from the its chunk id
   *
   * e.g. if we ask for the chunkId (1,0,0) with a chunkWidth of 32,
   * we will get back the following chunkId (32,0,0)
   */
  static getChunkOriginPosition(chunkID: ChunkID): Coordinate {
    const {
      x: chunkX,
      y: chunkY,
      z: chunkZ,
    } = Chunk.chunkIdAsCoordinate(chunkID);

    const offsetStartX = chunkX * Chunk.WIDTH;
    const offsetStartY = chunkY * Chunk.HEIGHT;
    const offsetStartZ = chunkZ * Chunk.WIDTH;

    return { x: offsetStartX, y: offsetStartY, z: offsetStartZ };
  }
}
