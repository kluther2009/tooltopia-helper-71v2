
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
