import { Annotation } from "./types";

export const setupCanvas = (
  canvas: HTMLCanvasElement,
  containerWidth: number,
  containerHeight: number
) => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = containerWidth * dpr;
  canvas.height = containerHeight * dpr;
  canvas.style.width = `${containerWidth}px`;
  canvas.style.height = `${containerHeight}px`;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  return ctx;
};

export const drawImageOnCanvas = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) => {
  const containerWidth = canvas.width;
  const containerHeight = canvas.height;
  const dpr = window.devicePixelRatio || 1;

  const scale = Math.min(
    (containerWidth / dpr) / image.width,
    (containerHeight / dpr) / image.height
  );
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = ((containerWidth / dpr) - scaledWidth) / 2;
  const y = ((containerHeight / dpr) - scaledHeight) / 2;

  ctx.clearRect(0, 0, containerWidth / dpr, containerHeight / dpr);
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  return {
    scale,
    x,
    y,
    scaledWidth,
    scaledHeight
  };
};

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  startPos: { x: number; y: number },
  currentPos: { x: number; y: number }
) => {
  const dpr = window.devicePixelRatio || 1;
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  
  const x = Math.min(startPos.x, currentPos.x) / dpr;
  const y = Math.min(startPos.y, currentPos.y) / dpr;
  const width = Math.abs(currentPos.x - startPos.x) / dpr;
  const height = Math.abs(currentPos.y - startPos.y) / dpr;
  
  ctx.strokeRect(x, y, width, height);
};

export const drawAnnotation = (
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  canvasScale: number = 1
) => {
  const { coordinates, tool } = annotation;
  
  // Draw rectangle
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    coordinates.x * canvasScale,
    coordinates.y * canvasScale,
    coordinates.width * canvasScale,
    coordinates.height * canvasScale
  );

  // Draw tool name with background
  ctx.font = '14px Arial';
  const textMetrics = ctx.measureText(tool.name);
  const padding = 4;
  const textHeight = 16;
  
  // Draw background rectangle for text
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    coordinates.x * canvasScale,
    coordinates.y * canvasScale - textHeight - padding * 2,
    textMetrics.width + padding * 2,
    textHeight + padding * 2
  );

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    tool.name,
    coordinates.x * canvasScale + padding,
    coordinates.y * canvasScale - padding
  );
};