import { Annotation } from "./types";

export const setupCanvas = (
  canvas: HTMLCanvasElement,
  containerWidth: number,
  containerHeight: number
) => {
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  return canvas.getContext('2d');
};

export const drawImageOnCanvas = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) => {
  const containerWidth = canvas.width;
  const containerHeight = canvas.height;

  const scale = Math.min(
    containerWidth / image.width,
    containerHeight / image.height
  );
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (containerWidth - scaledWidth) / 2;
  const y = (containerHeight - scaledHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
};

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  startPos: { x: number; y: number },
  currentPos: { x: number; y: number }
) => {
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    startPos.x,
    startPos.y,
    currentPos.x - startPos.x,
    currentPos.y - startPos.y
  );
};

export const drawAnnotation = (
  ctx: CanvasRenderingContext2D,
  annotation: Annotation
) => {
  const { coordinates, tool } = annotation;
  
  // Draw rectangle
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    coordinates.x,
    coordinates.y,
    coordinates.width,
    coordinates.height
  );

  // Draw tool name with background
  ctx.font = '14px Arial';
  const textMetrics = ctx.measureText(tool.name);
  const padding = 4;
  const textHeight = 16;
  
  // Draw background rectangle for text
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    coordinates.x,
    coordinates.y - textHeight - padding * 2,
    textMetrics.width + padding * 2,
    textHeight + padding * 2
  );

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    tool.name,
    coordinates.x + padding,
    coordinates.y - padding
  );
};