'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useScene } from '@pascal-app/core';
import { BuildingRenderer } from './building/building-renderer';
import { CeilingRenderer } from './ceiling/ceiling-renderer';
import { DoorRenderer } from './door/door-renderer';
import { GuideRenderer } from './guide/guide-renderer';
import { ItemRenderer } from './item/item-renderer';
import { LevelRenderer } from './level/level-renderer';
import { RoofRenderer } from './roof/roof-renderer';
import { RoofSegmentRenderer } from './roof-segment/roof-segment-renderer';
import { ScanRenderer } from './scan/scan-renderer';
import { SiteRenderer } from './site/site-renderer';
import { SlabRenderer } from './slab/slab-renderer';
import { WallRenderer } from './wall/wall-renderer';
import { WindowRenderer } from './window/window-renderer';
import { ZoneRenderer } from './zone/zone-renderer';
export const NodeRenderer = ({ nodeId }) => {
    const node = useScene((state) => state.nodes[nodeId]);
    if (!node)
        return null;
    return (_jsxs(_Fragment, { children: [node.type === 'site' && _jsx(SiteRenderer, { node: node }), node.type === 'building' && _jsx(BuildingRenderer, { node: node }), node.type === 'ceiling' && _jsx(CeilingRenderer, { node: node }), node.type === 'level' && _jsx(LevelRenderer, { node: node }), node.type === 'item' && _jsx(ItemRenderer, { node: node }), node.type === 'slab' && _jsx(SlabRenderer, { node: node }), node.type === 'wall' && _jsx(WallRenderer, { node: node }), node.type === 'door' && _jsx(DoorRenderer, { node: node }), node.type === 'window' && _jsx(WindowRenderer, { node: node }), node.type === 'zone' && _jsx(ZoneRenderer, { node: node }), node.type === 'roof' && _jsx(RoofRenderer, { node: node }), node.type === 'roof-segment' && _jsx(RoofSegmentRenderer, { node: node }), node.type === 'scan' && _jsx(ScanRenderer, { node: node }), node.type === 'guide' && _jsx(GuideRenderer, { node: node })] }));
};
