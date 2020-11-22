import React, { useState, useEffect } from "react";
import Raindrop from "./Raindrop";

import Button from "@material-ui/core/Button";
import styled from "styled-components";

const StyledDiv = styled.div`
  width: width,
  height: height,
  top: 0,
  position: "fixed",
  padding: "6px",
`;

const RaindropContainer = ({ width, height, loaded }) => {
  const [raindrops, setRaindrops] = useState([
    { id: 1, x: 6, y: 0 },
    { id: 2, x: 50, y: 20 },
  ]);

  const updateRaindrops = raindrops => {
    setTimeout(() => {
      let newRaindrops = [];
      raindrops.forEach(raindrop => {
        let newPos = { ...raindrop };
        newPos.y++;
        newRaindrops.push(newPos);
      });
      if (Math.floor(Math.random() * Math.floor(100)) === 42) {
        newRaindrops.push({
          id: 2,
          x: Math.floor(Math.random() * Math.floor(800)) + 6,
          y: 0,
        });
      }
      setRaindrops(newRaindrops);
      updateRaindrops(newRaindrops);
    }, 50);
  };

  return (
    <>
      <StyledDiv>
        {raindrops.map(raindrop => {
          return <Raindrop left={raindrop.x} top={raindrop.y} />;
        })}
      </StyledDiv>
      <Button onClick={() => updateRaindrops(raindrops)}>Start Game</Button>
    </>
  );
};

export default RaindropContainer;
