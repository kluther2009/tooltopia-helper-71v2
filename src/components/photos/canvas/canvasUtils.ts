import { Annotation } from "./types";

export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);

  return ctx;
}

export function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
  const imageAspect = image.width / image.height;
  
  let drawWidth = canvas.clientWidth;
  let drawHeight = canvas.clientHeight;
  let x = 0;
  let y = 0;
  
  if (canvasAspect > imageAspect) {
    drawWidth = drawHeight * imageAspect;
    x = (canvas.clientWidth - drawWidth) / 2;
  } else {
    drawHeight = drawWidth / imageAspect;
    y = (canvas.clientHeight - drawHeight) / 2;
  }

  ctx.drawImage(image, x, y, drawWidth, drawHeight);

  return {
    scale: drawWidth / image.width,
    x,
    y,
    scaledWidth: drawWidth,
    scaledHeight: drawHeight
  };
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  metrics: { scale: number; x: number; y: number },
  isHighlighted: boolean = false
) {
  const { coordinates, tool } = annotation;
  
  // Scale coordinates to canvas size
  const scaledX = coordinates.x * metrics.scale + metrics.x;
  const scaledY = coordinates.y * metrics.scale + metrics.y;
  const scaledWidth = coordinates.width * metrics.scale;
  const scaledHeight = coordinates.height * metrics.scale;

  // Draw rectangle
  ctx.beginPath();
  ctx.strokeStyle = isHighlighted ? '#00ff00' : '#ff0000';
  ctx.lineWidth = isHighlighted ? 3 : 2;
  ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

  // Draw tool name
  if (tool?.name) {
    ctx.font = isHighlighted ? 'bold 16px Arial' : '14px Arial';
    ctx.fillStyle = isHighlighted ? '#00ff00' : '#ff0000';
    ctx.fillText(tool.name, scaledX, scaledY - 5);
  }
}

export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  const width = end.x - start.x;
  const height = end.y - start.y;

  ctx.beginPath();
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(start.x, start.y, width, height);
}