'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useScene } from '@pascal-app/core';
import { NodeRenderer } from './node-renderer';
export const SceneRenderer = () => {
    const rootNodes = useScene((state) => state.rootNodeIds);
    return (_jsx("group", { name: "scene-renderer", children: rootNodes.map((nodeId) => (_jsx(NodeRenderer, { nodeId: nodeId }, nodeId))) }));
};
