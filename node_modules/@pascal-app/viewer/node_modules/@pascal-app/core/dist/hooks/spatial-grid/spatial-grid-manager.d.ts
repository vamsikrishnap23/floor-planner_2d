import type { AnyNode } from '../../schema';
/**
 * Point-in-polygon test using ray casting algorithm.
 */
export declare function pointInPolygon(px: number, pz: number, polygon: Array<[number, number]>): boolean;
/**
 * Test if an item's footprint overlaps with a polygon.
 * Checks: any item corner inside polygon, or any polygon vertex inside item AABB, or edges intersect.
 */
export declare function itemOverlapsPolygon(position: [number, number, number], dimensions: [number, number, number], rotation: [number, number, number], polygon: Array<[number, number]>, inset?: number): boolean;
/**
 * Test if a wall segment overlaps with a polygon.
 * A wall is considered to overlap if:
 * - Its midpoint is inside the polygon (wall crosses through)
 * - At least one endpoint is inside (wall partially or fully in slab)
 * - It's collinear with and overlaps a polygon edge (wall on slab boundary)
 *
 * Note: A wall with just one endpoint touching the edge but the rest outside
 * is NOT considered overlapping (adjacent only).
 */
export declare function wallOverlapsPolygon(start: [number, number], end: [number, number], polygon: Array<[number, number]>): boolean;
export declare class SpatialGridManager {
    private readonly floorGrids;
    private readonly wallGrids;
    private readonly walls;
    private readonly slabsByLevel;
    private readonly ceilingGrids;
    private readonly ceilings;
    private readonly itemCeilingMap;
    private readonly cellSize;
    constructor(cellSize?: number);
    private getFloorGrid;
    private getWallGrid;
    private getWallLength;
    private getWallHeight;
    private getCeilingGrid;
    private getSlabMap;
    handleNodeCreated(node: AnyNode, levelId: string): void;
    handleNodeUpdated(node: AnyNode, levelId: string): void;
    handleNodeDeleted(nodeId: string, nodeType: string, levelId: string): string[];
    canPlaceOnFloor(levelId: string, position: [number, number, number], dimensions: [number, number, number], rotation: [number, number, number], ignoreIds?: string[]): {
        valid: boolean;
        conflictIds: string[];
    };
    /**
     * Check if an item can be placed on a wall
     * @param levelId - the level containing the wall
     * @param wallId - the wall to check
     * @param localX - X position in wall-local space (distance from wall start)
     * @param localY - Y position (height from floor)
     * @param dimensions - item dimensions [width, height, depth]
     * @param attachType - 'wall' (needs both sides) or 'wall-side' (needs one side)
     * @param side - which side for 'wall-side' items
     * @param ignoreIds - item IDs to ignore in collision check
     */
    canPlaceOnWall(levelId: string, wallId: string, localX: number, localY: number, dimensions: [number, number, number], attachType?: 'wall' | 'wall-side', side?: 'front' | 'back', ignoreIds?: string[]): {
        valid: boolean;
        conflictIds: string[];
        adjustedY: number;
        wasAdjusted: boolean;
    } | {
        valid: boolean;
        conflictIds: never[];
    };
    getWallForItem(levelId: string, itemId: string): string | undefined;
    /**
     * Get the total slab elevation at a given (x, z) position on a level.
     * Returns the highest slab elevation if the point is inside any slab polygon (but not in any holes), otherwise 0.
     */
    getSlabElevationAt(levelId: string, x: number, z: number): number;
    /**
     * Get the slab elevation for an item using its full footprint (bounding box).
     * Checks if any part of the item's rotated footprint overlaps with any slab polygon (excluding holes).
     * Returns the highest overlapping slab elevation, or 0 if none.
     */
    getSlabElevationForItem(levelId: string, position: [number, number, number], dimensions: [number, number, number], rotation: [number, number, number]): number;
    /**
     * Get the slab elevation for a wall by checking if it overlaps with any slab polygon (excluding holes).
     * Uses wallOverlapsPolygon which handles edge cases (points on boundary, collinear segments).
     * Returns the highest slab elevation found, or 0 if none.
     */
    getSlabElevationForWall(levelId: string, start: [number, number], end: [number, number]): number;
    /**
     * Check if an item can be placed on a ceiling.
     * Validates that the footprint is within the ceiling polygon (but not in any holes) and doesn't overlap other ceiling items.
     */
    canPlaceOnCeiling(ceilingId: string, position: [number, number, number], dimensions: [number, number, number], rotation: [number, number, number], ignoreIds?: string[]): {
        valid: boolean;
        conflictIds: string[];
    };
    clearLevel(levelId: string): void;
    clear(): void;
}
export declare const spatialGridManager: SpatialGridManager;
//# sourceMappingURL=spatial-grid-manager.d.ts.map