import mitt from 'mitt';
// Event suffixes - exported for use in hooks
export const eventSuffixes = [
    'click',
    'move',
    'enter',
    'leave',
    'pointerdown',
    'pointerup',
    'context-menu',
    'double-click',
];
export const emitter = mitt();
