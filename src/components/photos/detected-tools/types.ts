
export interface CoordinateSystem {
  origin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x_axis_direction: 'left-to-right' | 'right-to-left';
  y_axis_direction: 'top-to-bottom' | 'bottom-to-top';
}

export interface Tool {
  label: string;
  box_2d: number[];
}

export interface BoxCoordinates {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}
