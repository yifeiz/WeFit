import React from "react";

const CanvasContainer = ({ getCanvas }) => {
  return <canvas className="webcam" ref={getCanvas} />;
};

export default CanvasContainer;
