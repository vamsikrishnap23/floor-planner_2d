import { useScene } from '@pascal-app/core';
export declare const DEFAULT_LEVEL_HEIGHT = 2.5;
export declare function getLevelHeight(levelId: string, nodes: ReturnType<typeof useScene.getState>['nodes']): number;
/**
 * Instantly snaps all level Objects3D to their true stacked Y positions
 * (ignores levelMode — always uses stacked, no exploded gap).
 *
 * Returns a restore function that reverts each level's Y to what it was
 * before the snap, so lerp animations in LevelSystem can continue undisturbed.
 *
 * Usage:
 *   const restore = snapLevelsToTruePositions()
 *   renderer.render(scene, camera)
 *   restore()
 */
export declare function snapLevelsToTruePositions(): () => void;
//# sourceMappingURL=level-utils.d.ts.map