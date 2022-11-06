import React, { useState, useEffect } from "react";
import { useCanvas } from "./CanvasContext";

export function Canvas({ socket }) {
  const {
    canvasRef,
    prepareCanvas,
    startDrawing,
    ontouchstart,
    finishDrawing,
    draw,
    ontouchmove,
  } = useCanvas();

  useEffect(() => {
    prepareCanvas();
  }, []);

  return (
    <canvas
      onMouseDown={startDrawing}
      onTouchStart={ontouchstart}
      onMouseUp={finishDrawing}
      onTouchEnd={finishDrawing}
      onMouseMove={draw}
      onTouchMove={ontouchmove}
      ref={canvasRef}
    />
  );
}
