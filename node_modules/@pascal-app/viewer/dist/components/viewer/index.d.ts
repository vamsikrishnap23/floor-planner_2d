import { type ThreeToJSXElements } from '@react-three/fiber';
import * as THREE from 'three/webgpu';
declare module '@react-three/fiber' {
    interface ThreeElements extends ThreeToJSXElements<typeof THREE> {
    }
}
interface ViewerProps {
    children?: React.ReactNode;
    selectionManager?: 'default' | 'custom';
    perf?: boolean;
}
declare const Viewer: React.FC<ViewerProps>;
export default Viewer;
//# sourceMappingURL=index.d.ts.map