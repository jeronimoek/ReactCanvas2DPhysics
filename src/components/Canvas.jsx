import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

const Canvas = (props) => {
  const { draw, height, width, onClick, onRightClick } = props;
  const canvas = useRef();

  useEffect(() => {
    const context = canvas.current.getContext("2d");
    canvas.current.width = width;
    canvas.current.height = height;
    const drawFunc = (ms) => {
      requestAnimationFrame(drawFunc);
      // setTimeout(drawFunc, 1000);
      context.fillStyle = "rgba(0,0,0,0.2)";
      context.fillRect(0, 0, width, height);
      draw(context, ms);
    };
    drawFunc(0);
  });

  useEffect(() => {
    // Prevent right click popover
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  });

  return (
    <canvas
      ref={canvas}
      height={height}
      width={width}
      onClick={onClick}
      onAuxClick={onRightClick}
    />
  );
};

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default Canvas;
