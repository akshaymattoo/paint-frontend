import React, { useContext, useRef, useState } from "react";
import io from "socket.io-client";
const CanvasContext = React.createContext();

console.log(process.env.REACT_APP_ENV);
const socket_url =
  process.env.REACT_APP_ENV === "development"
    ? "http://localhost:3001"
    : "https://paint-server.onrender.com";
const socket = io.connect(socket_url);

export const CanvasProvider = ({ children }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  var canvastop;
  var lastx;
  var lasty;
  const prepareCanvas = () => {
    const canvas = canvasRef.current;
    canvastop = canvasRef.current.offsetTop; // for mobile devices

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
    socket.on("mouse", newDrawing);
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const newDrawing = ({ mouseX, mouseY }) => {
    console.log("In new drawing ", mouseX, mouseY);

    contextRef.current.lineTo(mouseX, mouseY);
    contextRef.current.stroke();
  };
  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    socket.emit("mouse", {
      mouseX: offsetX,
      mouseY: offsetY,
    });
  };

  function dot(x, y) {
    contextRef.current.beginPath();
    contextRef.current.fillStyle = "#000000";
    contextRef.current.arc(x, y, 1, 0, Math.PI * 2, true);
    contextRef.current.fill();
    contextRef.current.stroke();
    contextRef.current.closePath();
  }

  function line(fromx, fromy, tox, toy) {
    contextRef.current.beginPath();
    contextRef.current.moveTo(fromx, fromy);
    contextRef.current.lineTo(tox, toy);
    contextRef.current.stroke();
    contextRef.current.closePath();
  }

  function ontouchstart(event) {
    event.preventDefault();

    lastx = event.touches[0].clientX;
    lasty = event.touches[0].clientY - canvastop;

    dot(lastx, lasty);
    socket.emit("mouse", {
      mouseX: lastx,
      mouseY: lasty,
    });
  }

  function ontouchmove(event) {
    event.preventDefault();

    var newx = event.touches[0].clientX;
    var newy = event.touches[0].clientY - canvastop;

    line(lastx, lasty, newx, newy);

    lastx = newx;
    lasty = newy;
    socket.emit("mouse", {
      mouseX: lastx,
      mouseY: lasty,
    });
  }
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    //context.fillRect(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        contextRef,
        prepareCanvas,
        startDrawing,
        ontouchstart,
        finishDrawing,
        clearCanvas,
        draw,
        ontouchmove,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);
