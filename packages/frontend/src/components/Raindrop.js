import React from "react";
import raindropBlue from "./raindrop-blue.png";
import raindropRed from "./raindrop-red.png";
import raindropGreen from "./raindrop-green.png";

const Raindrop = ({ top, left }) => {
  return (
    <div style={{ top, left, position: "absolute" }}>
      <img src={raindropBlue} style={{ width: "50px", height: "100px" }} />
    </div>
  );
};

export default Raindrop;
