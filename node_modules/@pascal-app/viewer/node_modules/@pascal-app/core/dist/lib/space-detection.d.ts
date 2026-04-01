import type { WallNode } from '../schema';
export type Space = {
    id: string;
    levelId: string;
    polygon: Array<[number, number]>;
    wallIds: string[];
    isExterior: boolean;
};
/**
 * Initializes space detection sync with scene and editor stores
 * Call this once during app initialization
 */
export declare function initSpaceDetectionSync(sceneStore: any, // useScene store
editorStore: any): () => void;
type WallSideUpdate = {
    wallId: string;
    frontSide: 'interior' | 'exterior' | 'unknown';
    backSide: 'interior' | 'exterior' | 'unknown';
};
/**
 * Detects spaces for a level by flood-filling a grid from the edges
 * Returns wall side updates and detected spaces
 */
export declare function detectSpacesForLevel(levelId: string, walls: WallNode[], gridResolution?: number): {
    wallUpdates: WallSideUpdate[];
    spaces: Space[];
};
/**
 * Checks if a wall touches any other walls
 * Used to determine if space detection should run
 */
export declare function wallTouchesOthers(wall: WallNode, otherWalls: WallNode[]): boolean;
export {};
//# sourceMappingURL=space-detection.d.ts.map