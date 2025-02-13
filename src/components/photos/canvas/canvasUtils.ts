
export const drawImageOnCanvas = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) => {
  const containerWidth = canvas.clientWidth;
  const containerHeight = canvas.clientHeight;
  const imageAspectRatio = image.width / image.height;
  const containerAspectRatio = containerWidth / containerHeight;

  let scaledWidth, scaledHeight, x, y;

  if (imageAspectRatio > containerAspectRatio) {
    scaledWidth = containerWidth;
    scaledHeight = containerWidth / imageAspectRatio;
    x = 0;
    y = (containerHeight - scaledHeight) / 2;
  } else {
    scaledHeight = containerHeight;
    scaledWidth = containerHeight * imageAspectRatio;
    x = (containerWidth - scaledWidth) / 2;
    y = 0;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  return {
    scale: scaledWidth / image.width,
    x,
    y,
    scaledWidth,
    scaledHeight
  };
};

export const drawAnnotation = (
  ctx: CanvasRenderingContext2D,
  annotation: any,
  metrics: { scale: number; x: number; y: number },
  isSelected: boolean = false
) => {
  const coords = annotation.coordinates;
  const x = coords.x * metrics.scale + metrics.x;
  const y = coords.y * metrics.scale + metrics.y;
  const width = coords.width * metrics.scale;
  const height = coords.height * metrics.scale;

  ctx.strokeStyle = isSelected ? '#00ff00' : '#ff0000';
  ctx.lineWidth = isSelected ? 3 : 2;
  ctx.strokeRect(x, y, width, height);

  // Draw tool name
  if (annotation.tool?.name) {
    ctx.font = '14px Arial';
    ctx.fillStyle = isSelected ? '#00ff00' : '#ff0000';
    ctx.fillText(annotation.tool.name, x, y - 5);
  }
};

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  current: { x: number; y: number }
) => {
  const width = current.x - start.x;
  const height = current.y - start.y;

  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  ctx.strokeRect(start.x, start.y, width, height);
};

export const setupCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null => {
  const scale = window.devicePixelRatio;
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);
  return ctx;
};
