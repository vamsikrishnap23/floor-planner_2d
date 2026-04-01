import { sceneRegistry, useScene } from '@pascal-app/core';
import { useFrame } from '@react-three/fiber';
import { lerp } from 'three/src/math/MathUtils.js';
import useViewer from '../../store/use-viewer';
import { getLevelHeight } from './level-utils';
const EXPLODED_GAP = 5;
export const LevelSystem = () => {
    useFrame((_, delta) => {
        const nodes = useScene.getState().nodes;
        const levelMode = useViewer.getState().levelMode;
        const selectedLevel = useViewer.getState().selection.levelId;
        const entries = [];
        sceneRegistry.byType.level.forEach((levelId) => {
            const obj = sceneRegistry.nodes.get(levelId);
            const level = nodes[levelId];
            if (obj && level) {
                entries.push({ levelId, index: level.level ?? 0, obj });
            }
        });
        entries.sort((a, b) => a.index - b.index);
        // Walk sorted levels, accumulating base Y offsets
        let cumulativeY = 0;
        for (const { levelId, index, obj } of entries) {
            const level = nodes[levelId];
            const baseY = cumulativeY;
            const explodedExtra = levelMode === 'exploded' ? index * EXPLODED_GAP : 0;
            const targetY = baseY + explodedExtra;
            obj.position.y = lerp(obj.position.y, targetY, delta * 12); // Smoothly animate to new Y position
            obj.visible = levelMode !== 'solo' || level?.id === selectedLevel || !selectedLevel;
            cumulativeY += getLevelHeight(levelId, nodes);
        }
    }, 5); // Using a lower priority so it runs after transforms from other systems have settled
    return null;
};
