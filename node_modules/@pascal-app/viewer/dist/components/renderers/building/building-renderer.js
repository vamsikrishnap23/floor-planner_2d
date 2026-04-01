import { jsx as _jsx } from "react/jsx-runtime";
import { useRegistry } from '@pascal-app/core';
import { useRef } from 'react';
import { useNodeEvents } from '../../../hooks/use-node-events';
import { NodeRenderer } from '../node-renderer';
export const BuildingRenderer = ({ node }) => {
    const ref = useRef(null);
    useRegistry(node.id, node.type, ref);
    const handlers = useNodeEvents(node, 'building');
    return (_jsx("group", { ref: ref, ...handlers, children: node.children.map((childId) => (_jsx(NodeRenderer, { nodeId: childId }, childId))) }));
};
