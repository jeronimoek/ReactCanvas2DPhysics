import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

const Canvas = ({ draw, height, width }) => {
  const canvas = useRef();

  useEffect(() => {
    const context = canvas.current.getContext("2d");
    canvas.current.width = width;
    canvas.current.height = height;
    const drawFunc = () => {
      requestAnimationFrame(drawFunc);
      // setTimeout(drawFunc, 1000);
      draw(context);
      context.fillStyle = "rgba(0,0,0,0.1)";
      context.fillRect(0, 0, width, height);
    };
    drawFunc();
  });

  return <canvas ref={canvas} height={height} width={width} />;
};

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default Canvas;
