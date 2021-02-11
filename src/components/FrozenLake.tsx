import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import Environment from "./Environment";

/**
 * Enum actions for the environment to given them more readability/meaning than just numbers.
 */
enum Actions {
  Up,
  Right,
  Down,
  Left,
}

/**
 * Styled components.
 */
const MapWrapper = styled.div`
  display: grid;
  grid: repeat(4, 100px) / repeat(4, 100px);
  align-items: center;
  justify-items: center;
  flex-basis: 400px;
`;
const MapSquare = styled.div`
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ type }: { type: "Hole" | "Ice" | "Goal" }) => {
    if (type === "Hole")
      return css`
        background: #457b9d;
      `;
    else if (type === "Goal")
      return css`
        background: #e3b23c;
      `;
    else
      return css`
        background: #a8dadc;
      `;
  }};
`;

/**
 * Props for the FrozenLake environment.
 */
interface Props {
  mapSize?: 4;
  p?: number;
  isSlippery?: boolean;
}

/**
 * The FrozenLake environment.
 * @param props Object of props
 */
const FrozenLake: React.FC<Props> = ({
  mapSize = 4,
  p = 0.8,
  isSlippery = true,
}) => {
  const action_space = [0, 1, 2, 3]; // all possible actions
  //prettier-ignore
  const observation_space = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // all possible states
  const [currentSquare, setCurrentSquare] = useState(0); // current state

  // prettier-ignore
  const map = useMemo(() => ['F', 'F', 'F', 'F',
                'F', 'H', 'H', 'H',
                'F', 'F', 'F', 'F',
                'F', 'F', 'F', 'G'], [])
  const [done, setDone] = useState(false);
  console.log("FrozenLake re-rendered");

  const [agentAnimDuraction, setAgentAnimDuration] = useState(0.1);
  const [speed, setSpeed] = useState(100);

  /**
   * Convert a map index to a row and column
   * @param index the map index to find the row and column for
   */
  const IndexToRowsCols = useCallback(
    (index: number): [number, number] => {
      let row = Math.floor(index / mapSize);
      let col = index - row * mapSize;
      return [row, col];
    },
    [mapSize]
  );

  /**
   * Check if a move will go off map / is illegal
   * @param row
   * @param col
   * @param action
   */
  const InMap = useCallback(
    (square: number, action: number): boolean => {
      let [row, col] = IndexToRowsCols(square);
      // console.log(` InMap: [${row}, ${col}], ${action}`);
      if (row === 0 && action === 0) return false;
      if (row === mapSize - 1 && action === 2) return false;
      if (col === 0 && action === 3) return false;
      if (col === mapSize - 1 && action === 1) return false;
      return true;
    },
    [IndexToRowsCols, mapSize]
  );

  const Move = useCallback(
    (square: number, action: number): number => {
      var newState = square;
      if (InMap(square, action)) {
        switch (action) {
          case Actions.Up:
            newState = square - mapSize;
            setCurrentSquare(newState);
            break;
          case Actions.Right:
            newState = square + 1;
            setCurrentSquare(newState);
            break;
          case Actions.Down:
            newState = square + mapSize;
            setCurrentSquare(newState);
            break;
          case Actions.Left:
            newState = square - 1;
            setCurrentSquare(newState);
            break;
          default:
        }
      }
      return newState;
    },
    [InMap, mapSize]
  );

  /**
   * Step(action): [obs, rew, done, info]
   */
  const Step = useCallback(
    (action: number): [number, number, boolean, {}] => {
      var reward: number = 0,
        tempDone: boolean = done,
        newState: number = currentSquare;

      // check values of done and reward based on current square
      if (!tempDone) {
        newState = Move(currentSquare, action);
        let letter = map[newState];
        if ("HG".includes(letter)) {
          tempDone = true;
          setDone(tempDone);
        }

        if ("G".includes(letter)) {
          reward = 1; // positive reward for reaching goal
        } else if ("H".includes(letter)) {
          reward = 0; // negative reward for falling in a hole
        }

        if (newState === currentSquare) {
          reward = 0; // negative reward for going off map
        }
      } else {
        console.warn(
          "This environment has terminated. You should call `reset` before continuing."
        );
      }
      // console.log(`[${newState}, ${reward}, ${tempDone}]`);
      return [newState, reward, tempDone, {}];
    },
    [Move, currentSquare, done, map]
  );

  /**
   * Reset the enviroment to the starting values & set reset to trigger the agent to reset for new episode.
   */
  const Reset = () => {
    console.log(`-------- Resetting the Enviroment -----------`);
    setCurrentSquare(0);
    setDone(false);
  };

  const handleSpeedChange = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (e.currentTarget.id === "increase-speed") {
      console.log(`increasing speed`);
      setSpeed(speed + 20);
    } else if (e.currentTarget.id === "decrease-speed") {
      console.log(`decreasing speed`);
      setSpeed(speed - 20);
    }
  };

  useEffect(() => {
    setAgentAnimDuration(speed / 1000);
  }, [speed]);

  return (
    <Environment
      action_space={action_space}
      state_space={observation_space}
      Step={Step}
      Reset={Reset}
      speed={speed}
    >
      {/** The render/visual for this environment */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <MapWrapper>
            {map.map((v, i) => {
              if (v === "H") return <MapSquare key={i} type="Hole" />;
              else if (v === "G") return <MapSquare key={i} type="Goal" />;
              else return <MapSquare key={i} type="Ice" />;
            })}
          </MapWrapper>
          <div
            style={{
              width: "50px",
              height: "50px",
              background: "red",
              borderRadius: "50%",
              transitionProperty: "all",
              transitionDuration: `${agentAnimDuraction}s`,
              transitionTimingFunction: "ease",
              position: "absolute",
              left: `${
                (currentSquare -
                  Math.floor(currentSquare / mapSize) * mapSize) *
                  100 +
                25
              }px`,
              top: `${Math.floor(currentSquare / mapSize) * 100 + 25}px`,
            }}
          ></div>
          <div>{currentSquare}</div>
        </div>
        <button id="decrease-speed" onClick={handleSpeedChange}>
          - Speed
        </button>
        <button id="increase-speed" onClick={handleSpeedChange}>
          + Speed
        </button>
        <div>{speed}</div>
      </div>
    </Environment>
  );
};

/**
 * Agent={
        <TestAgent
          step={Step}
          action_space={action_space}
          observation_space={observation_space}
          done={done}
          reset={Reset}
          speed={speed}
        />
      }
 */

export default FrozenLake;
