declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
    color?: string;
  }

  export type LucideIcon = FC<LucideProps>;

  // A catch-all for any named export from lucide-react
  // This bypasses the TS2305 error for missing exports.
  export const Activity: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Clock: LucideIcon;
  export const Coffee: LucideIcon;
  export const Droplets: LucideIcon;
  export const Flame: LucideIcon;
  export const Footprints: LucideIcon;
  export const Gauge: LucideIcon;
  export const Heart: LucideIcon;
  export const Menu: LucideIcon;
  export const Moon: LucideIcon;
  export const Sun: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;
}