import type { AnyNode, AnyNodeId } from '../../schema';
import type { SceneState } from '../use-scene';
export declare const createNodesAction: (set: (fn: (state: SceneState) => Partial<SceneState>) => void, get: () => SceneState, ops: {
    node: AnyNode;
    parentId?: AnyNodeId;
}[]) => void;
export declare const updateNodesAction: (set: (fn: (state: SceneState) => Partial<SceneState>) => void, get: () => SceneState, updates: {
    id: AnyNodeId;
    data: Partial<AnyNode>;
}[]) => void;
export declare const deleteNodesAction: (set: (fn: (state: SceneState) => Partial<SceneState>) => void, get: () => SceneState, ids: AnyNodeId[]) => void;
//# sourceMappingURL=node-actions.d.ts.map