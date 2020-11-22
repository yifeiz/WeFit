import React, { useState, useEffect } from "react";
import Raindrop from "./Raindrop";

import Button from "@material-ui/core/Button";
import styled from "styled-components";

const StyledDiv = styled.div`
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  top: 0;
  position: fixed;
  padding: 6px;
`;

const RaindropContainer = ({ width, height, loaded, main , pushupCount, situpCount, squatCount, startTimer}) => {
  const [raindrops, setRaindrops] = useState([{ id: 1, x: 6, y: 0 }]);
  const [strikes, setStrikes] = useState(0);

  const updateRaindrops = (raindrops, strikes) => {
    setTimeout(() => {
      let newRaindrops = [];
      raindrops.forEach(raindrop => {
        let newPos = { ...raindrop };
        newPos.y++;
        if (newPos.y < 600) {
          newRaindrops.push(newPos);
        } else {
          strikes++;
          setStrikes(strikes);
        }
      });
      if (Math.floor(Math.random() * Math.floor(100)) === 42) {
        newRaindrops.push({
          id: 2,
          x: Math.floor(Math.random() * Math.floor(800)) + 6,
          y: 0,
        });
      }
      setRaindrops(newRaindrops);
      updateRaindrops(newRaindrops, strikes);
    }, 50);
  };

  const startGame = async () => {
    await startTimer();
    updateRaindrops(raindrops, strikes);
    main();
  };
  console.log(strikes);

  return (
    <>
      <StyledDiv $width={width} $height={height}>
        {raindrops.map(raindrop => {
          return <Raindrop left={raindrop.x} top={raindrop.y} />;
        })}
      </StyledDiv>
      <Button onClick={() => startGame()}>Start Game</Button>
    </>
  );
};

export default RaindropContainer;
