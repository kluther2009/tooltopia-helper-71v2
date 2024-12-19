export interface Annotation {
  id: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tool: {
    name: string;
  };
}

export interface CanvasCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}