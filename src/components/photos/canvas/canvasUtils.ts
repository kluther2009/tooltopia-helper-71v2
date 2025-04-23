
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
    scaledHeight,
    originalWidth: image.width,
    originalHeight: image.height
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
  imageMetrics: { scale: number; x: number; y: number; originalWidth: number; originalHeight: number }
) => {
  if (!annotation.coordinates) {
    console.log('Missing coordinates for annotation:', annotation);
    return;
  }

  // Ensure we have a tool name to display
  const toolName = annotation.tool?.name || "Unknown Tool";
  
  // Calculate the position based on the image metrics
  const x = annotation.coordinates.x * imageMetrics.scale + imageMetrics.x;
  const y = annotation.coordinates.y * imageMetrics.scale + imageMetrics.y;
  const width = annotation.coordinates.width * imageMetrics.scale;
  const height = annotation.coordinates.height * imageMetrics.scale;

  // Draw differently if the tool has been moved
  if (annotation.moved) {
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillRect(x, y, width, height);
    
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
    
    const movedText = `${toolName} (MOVED)`;
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    const textMetrics = ctx.measureText(movedText);
    const textPadding = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(
      x + width/2 - textMetrics.width/2 - textPadding,
      y + height/2 - 10,
      textMetrics.width + textPadding * 2,
      20
    );
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(movedText, x + width/2, y + height/2 + 5);
  } else {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.font = '14px Arial';
    const textMetrics = ctx.measureText(toolName);
    const padding = 4;
    const textHeight = 16;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(
      x,
      y - textHeight - padding * 2,
      textMetrics.width + padding * 2,
      textHeight + padding * 2
    );

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(
      toolName,
      x + padding,
      y - padding
    );
  }
};
