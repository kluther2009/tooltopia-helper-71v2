import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const PhotoAnnotation = ({ photoId, location, subLocation }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    ctx.strokeStyle = 'green';
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      currentPos.x - startPos.x,
      currentPos.y - startPos.y
    );
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const rect = canvasRef.current.getBoundingClientRect();
    const endPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const coordinates = {
      x: Math.min(startPos.x, endPos.x),
      y: Math.min(startPos.y, endPos.y),
      width: Math.abs(endPos.x - startPos.x),
      height: Math.abs(endPos.y - startPos.y)
    };

    // Navigate to add tool form with annotation data
    navigate('/tools/add', {
      state: {
        annotationData: {
          photoId,
          coordinates,
          location,
          subLocation,
          timestamp: Date.now()
        }
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      width={800}
      height={600}
      style={{ border: '1px solid #000' }}
    />
  );
};
