import React from "react";
import { useCanvas } from "./CanvasContext";

export const ClearCanvasButton = ({ socket }) => {
  const { clearCanvas } = useCanvas();

  return <button onClick={clearCanvas}>Clear</button>;
};
