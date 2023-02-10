import * as THREE from "three";
import { SEA_LEVEL } from "../config/constants";
import ChunkUtils from "../utils/ChunkUtils";
import { Coordinate } from "../utils/helpers";
import {
  BlockFace,
  BlockFacesGeometry,
  BlockType,
  getBlockTextureCoordinates,
} from "./Block";

export type ChunkID = string;
export default class Chunk {
  private _chunkID: ChunkID;
  private chunkWidth: number;
  private chunkHeight: number;
  private voxels: Uint8Array;

  constructor(
    chunkID: ChunkID,
    chunkWidth: number,
    chunkHeight: number,
    voxels?: Uint8Array
  ) {
    this._chunkID = chunkID;
    this.chunkWidth = chunkWidth;
    this.chunkHeight = chunkHeight;
    this.voxels =
      voxels ?? new Uint8Array(chunkHeight * chunkWidth * chunkWidth);
  }

  //TODO optimization: to decrease the number of meshes, we could pass an object
  // which stores which borders this voxel must have visible
  computeGeometryData({ x: startX, y: startY, z: startZ }: Coordinate) {
    const { chunkWidth, chunkHeight } = this;

    const soldidPositions: number[] = [];
    const solidNormals: number[] = [];
    const solidIndices: number[] = [];
    const solidUVs: number[] = [];

    const transparentPositions: number[] = [];
    const transparentNormals: number[] = [];
    const transparentIndices: number[] = [];
    const transparentUVs: number[] = [];

    // voxels generation
    for (let y = 0; y < chunkHeight; ++y) {
      const blockY = startY + y;
      for (let z = 0; z < chunkWidth; ++z) {
        const blockZ = startZ + z;
        for (let x = 0; x < chunkWidth; ++x) {
          const blockX = startX + x;

          const block = this.getVoxel({ x: blockX, y: blockY, z: blockZ });
          //FIXME
          const isBlockTransparent =
            block === BlockType.GLASS || block === BlockType.WATER;

          if (block === BlockType.WATER && blockY !== SEA_LEVEL - 1) {
            continue;
          }

          const positions = isBlockTransparent
            ? transparentPositions
            : soldidPositions;
          const normals = isBlockTransparent
            ? transparentNormals
            : solidNormals;
          const indices = isBlockTransparent
            ? transparentIndices
            : solidIndices;
          const uvs = isBlockTransparent ? transparentUVs : solidUVs;

          if (block) {
            // iterate over each face of this block
            for (const face of Object.keys(BlockFacesGeometry)) {
              const voxelFace = face as BlockFace;

              if (block === BlockType.WATER && voxelFace !== "top") {
                continue;
              }

              const { normal: dir, corners } = BlockFacesGeometry[voxelFace];

              // let's check the block neighbour of this face of the block
              const neighborBlock = this.getVoxel({
                x: blockX + dir[0],
                y: blockY + dir[1],
                z: blockZ + dir[2],
              });

              //FIXME
              const isNeighbourTransparent =
                neighborBlock === BlockType.GLASS ||
                neighborBlock === BlockType.WATER;

              // if the current block has no neighbor or has a transparent neighbour
              // we need to show this block face
              if (
                !neighborBlock ||
                (isNeighbourTransparent && !isBlockTransparent)
              ) {
                const ndx = positions.length / 3;

                for (const { pos, uv } of corners) {
                  // add corner position
                  positions.push(
                    pos[0] + blockX,
                    pos[1] + blockY,
                    pos[2] + blockZ
                  );

                  // add normal for this corner
                  normals.push(...dir);

                  const textureCoords = getBlockTextureCoordinates(
                    block,
                    voxelFace,
                    [uv[0], uv[1]]
                  );

                  uvs.push(textureCoords.x, textureCoords.y);
                }

                indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
              }
            }
          }
        }
      }
    }

    return {
      solid: {
        positions: soldidPositions,
        normals: solidNormals,
        indices: solidIndices,
        uvs: solidUVs,
      },
      transparent: {
        positions: transparentPositions,
        normals: transparentNormals,
        indices: transparentIndices,
        uvs: transparentUVs,
      },
    };
  }

  /**
   * Given a voxel position returns the value of the voxel in there.
   *
   * @returns the voxel value or null if the voxel does not belong to this chunk.
   */
  getVoxel(coord: Coordinate): BlockType | null {
    if (!this.isVoxelInChunk(coord)) {
      return null;
    }

    const voxelOffset = this.computeVoxelOffset(coord);
    return this.voxels[voxelOffset];
  }

  setVoxel(coord: Coordinate, voxel: BlockType) {
    // the voxel does not belong to this chunk, skip
    if (!this.isVoxelInChunk(coord)) {
      return;
    }

    const voxelOffset = this.computeVoxelOffset(coord);
    this.voxels[voxelOffset] = voxel;
  }

  /**
   *
   * @returns true if the voxel belongs to this chunk
   */
  isVoxelInChunk(voxelCoord: Coordinate) {
    const { chunkWidth, chunkHeight } = this;
    const actualChunkId = ChunkUtils.computeChunkIdFromPosition(
      voxelCoord,
      chunkWidth,
      chunkHeight
    );
    return actualChunkId === this._chunkID;
  }

  private computeVoxelOffset({ x, y, z }: Coordinate) {
    const { chunkWidth } = this;

    const [voxelX, voxelY, voxelZ] = this.getVoxelLocalCoordinates(x, y, z);

    return voxelY * chunkWidth * chunkWidth + voxelZ * chunkWidth + voxelX;
  }

  private getVoxelLocalCoordinates(x: number, y: number, z: number) {
    const { chunkWidth, chunkHeight } = this;

    const voxelX = THREE.MathUtils.euclideanModulo(x, chunkWidth) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, chunkHeight) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, chunkWidth) | 0;

    return [voxelX, voxelY, voxelZ];
  }

  getVoxels() {
    return this.voxels;
  }

  get id() {
    return this._chunkID;
  }

  get width() {
    return this.chunkWidth;
  }

  get height() {
    return this.chunkHeight;
  }

  _debug() {
    console.log(this.voxels);
  }
}
