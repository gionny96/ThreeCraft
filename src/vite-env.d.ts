/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_DEBUG_UI: string;

  readonly VITE_EDITING_ENABLED: string;
  readonly VITE_TERRAIN_GENERATION_ENABLED: string;
  readonly VITE_TERRAIN_OPTIMIZATION_ENABLED: string;
  readonly VITE_TREE_GENERATION_ENABLED: string;

  readonly VITE_TERRAIN_CHUNK_WIDTH: number;
  readonly VITE_TERRAIN_CHUNK_HEIGHT: number;

  readonly VITE_DEFAULT_HORIZONTAL_RENDER_DISTANCE_IN_CHUNKS: number;
  readonly VITE_TOP_RENDER_DISTANCE_IN_CHUNKS: number;
  readonly VITE_BOTTOM_RENDER_DISTANCE_IN_CHUNKS: number;

  readonly VITE_TESTING_MAP_ENABLED: string;
  readonly VITE_TESTING_MAP_EROSION?: number;
  readonly VITE_TESTING_MAP_CONTINENTALNESS?: number;
  readonly VITE_TESTING_MAP_PV?: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
