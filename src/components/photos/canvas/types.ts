export interface Annotation {
  id: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tool_id: string;
  tool: {
    id: string;
    name: string;
  };
  moved?: boolean;
}

export interface CanvasCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedTool {
  label: string;
  box_2d: number[];
}

export interface CoordinateSystem {
  origin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x_axis_direction: 'left-to-right' | 'right-to-left';
  y_axis_direction: 'top-to-bottom' | 'bottom-to-top';
}
