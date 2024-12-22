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
  const containerWidth = canvas.width / (window.devicePixelRatio || 1);
  const containerHeight = canvas.height / (window.devicePixelRatio || 1);

  const scale = Math.min(
    containerWidth / image.width,
    containerHeight / image.height
  );

  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (containerWidth - scaledWidth) / 2;
  const y = (containerHeight - scaledHeight) / 2;

  ctx.clearRect(0, 0, containerWidth, containerHeight);
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
  const x = Math.min(startPos.x, currentPos.x);
  const y = Math.min(startPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - startPos.x);
  const height = Math.abs(currentPos.y - startPos.y);
  
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
};

export const drawAnnotation = (
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  imageMetrics: { scale: number; x: number; y: number }
) => {
  const { coordinates, tool } = annotation;
  
  // Convert stored coordinates back to canvas space
  const x = coordinates.x * imageMetrics.scale + imageMetrics.x;
  const y = coordinates.y * imageMetrics.scale + imageMetrics.y;
  const width = coordinates.width * imageMetrics.scale;
  const height = coordinates.height * imageMetrics.scale;

  // Draw rectangle
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Draw tool name with background
  ctx.font = '14px Arial';
  const textMetrics = ctx.measureText(tool.name);
  const padding = 4;
  const textHeight = 16;
  
  // Draw background rectangle for text
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    x,
    y - textHeight - padding * 2,
    textMetrics.width + padding * 2,
    textHeight + padding * 2
  );

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    tool.name,
    x + padding,
    y - padding
  );
};