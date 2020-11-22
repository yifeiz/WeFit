import React from "react";
import raindropBlue from "./raindrop-blue.png";
import raindropRed from "./raindrop-red.png";
import raindropGreen from "./raindrop-green.png";
import { PUSHUP, SITUP, SQUAT } from "./types";

const Raindrop = ({ top, left, exerciseType }) => {
  let imgSrc;

  switch (exerciseType) {
    case PUSHUP:
      imgSrc = raindropBlue;
      break;
    case SITUP:
      imgSrc = raindropRed;
      break;
    case SQUAT:
    default:
      imgSrc = raindropGreen;
      break;
  }
  return (
    <div style={{ top, left, position: "absolute" }}>
      <img src={imgSrc} style={{ width: "50px", height: "100px" }} />
    </div>
  );
};

export default Raindrop;
