import React, { useState, useEffect } from "react";
import Raindrop from "./Raindrop";

import Button from "react-bootstrap/Button";

import styled from "styled-components";
import CircularProgress from "@material-ui/core/CircularProgress";
import { PUSHUP, SITUP, SQUAT } from "./types";

const StyledDiv = styled.div`
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  top: 70px;
  position: fixed;
  padding: 6px;
`;

const RaindropContainer = ({
  width,
  height,
  loaded,
  main,
  pushupCount,
  situpCount,
  squatCount,
  startTimer,
  isStock,
  strikes,
  setStrikes
}) => {

  

  const [raindrops, setRaindrops] = useState([
    { exerciseType: PUSHUP, x: 6, y: 0 },
  ]);
  const [isGameStarted, setGameStarted] = useState(false);

  console.log(pushupCount, situpCount, squatCount);

  useEffect(() => {
    console.log("Pushup detected");
    console.log(raindrops);
    const index = raindrops.findIndex(
      raindrop => raindrop.exerciseType === PUSHUP
    );
    if (index > -1) {
      let newRaindrops = [].concat(
        raindrops.slice(0, index),
        raindrops.slice(index + 1, raindrops.length)
      );
      setRaindrops(newRaindrops);
    }
  }, [pushupCount]);

  useEffect(() => {
    console.log("Situp");
    const index = raindrops.findIndex(
      raindrop => raindrop.exerciseType === SITUP
    );
    if (index > -1) {
      let newRaindrops = [].concat(
        raindrops.slice(0, index),
        raindrops.slice(index + 1, raindrops.length)
      );
      setRaindrops(newRaindrops);
    }
  }, [situpCount]);

  useEffect(() => {
    console.log("Squat");
    const index = raindrops.findIndex(
      raindrop => raindrop.exerciseType === SQUAT
    );
    if (index > -1) {
      let newRaindrops = [].concat(
        raindrops.slice(0, index),
        raindrops.slice(index + 1, raindrops.length)
      );
      setRaindrops(newRaindrops);
    }
  }, [squatCount]);

  useEffect(() => {
    if (!isGameStarted) return;
    let timer = setTimeout(() => {
      let newRaindrops = [];
      raindrops.forEach(raindrop => {
        let newPos = { ...raindrop };
        newPos.y++;
        if (newPos.y < height - 100) {
          newRaindrops.push(newPos);
        } else {
          if(isStock){
            setStrikes();
          }
        }
      });
      if (Math.floor(Math.random() * Math.floor(100)) === 42) {
        let exerciseType;
        switch (Math.floor(Math.random() * Math.floor(3))) {
          case 1:
            exerciseType = PUSHUP;
            break;
          case 2:
            exerciseType = SITUP;
            break;
          case 3:
          default:
            exerciseType = SQUAT;
            break;
        }
        newRaindrops.push({
          exerciseType,
          x: Math.floor(Math.random() * Math.floor(800)) + 6,
          y: 0,
        });
      }
      setRaindrops(newRaindrops);
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [isGameStarted, raindrops, strikes]);

  const startGame = async () => {
    await startTimer();
    setGameStarted(true);
    main();
  };
  if (!loaded) {
    return <CircularProgress />;
  }
  else if (strikes >= 3) {
    console.log("Stopped!");
  }

  return (
    <>
    {strikes < 3 && <StyledDiv $width={width} $height={height}>
        {raindrops.map(raindrop => {
          return (
            <Raindrop
              left={raindrop.x}
              top={raindrop.y}
              key={`${raindrop.exerciseType}-${raindrop.x}`}
              exerciseType={raindrop.exerciseType}
            />
          );
        })}
      </StyledDiv>}
      
      <Button
        variant="outline-primary"
        style={{ marginTop: "12px", marginLeft: "15px" }}
        onClick={() => startGame()}
      >
        Start Game
      </Button>
    </>
  );
};

export default RaindropContainer;
