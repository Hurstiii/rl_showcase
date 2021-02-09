import { useCallback, useEffect, useMemo, useState } from "react";
import "./FrozenLake.css";
import TestAgent from "./TestAgent";

enum Direction {
  Up,
  Right,
  Down,
  Left,
}

interface Props {
  mapSize?: 4;
  p?: number;
  isSlippery?: boolean;
}

const FrozenLake: React.FC<Props> = ({
  mapSize = 4,
  p = 0.8,
  isSlippery = true,
}) => {
  const action_space = [0, 1, 2, 3]; // all possible actions
  //prettier-ignore
  const observation_space = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // all possible states
  const [currentSquare, setCurrentSquare] = useState(0); // current state

  // useEffect(() => {
  //   console.log(`currentSquare = ${currentSquare}`);
  // }, [currentSquare]);
  // prettier-ignore
  const map = useMemo(() => ['F', 'F', 'F', 'F',
                'F', 'H', 'H', 'H',
                'F', 'F', 'F', 'F',
                'F', 'F', 'F', 'G'], [])
  const [done, setDone] = useState(false);
  console.log("FrozenLake re-rendered");

  /**
   * Convert a map index to a row and column
   * @param index the map index to find the row and column for
   */
  const IndexToRowsCols = useCallback(
    (index: number): [number, number] => {
      let row = Math.floor(index / mapSize);
      let col = index - row * mapSize;
      // console.log(
      //   ` IndexToRowsCols: [${row}, ${col}, ${index}], mapSize=${mapSize}`
      // );
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
          case Direction.Up:
            newState = square - mapSize;
            setCurrentSquare(newState);
            break;
          case Direction.Right:
            newState = square + 1;
            setCurrentSquare(newState);
            break;
          case Direction.Down:
            newState = square + mapSize;
            setCurrentSquare(newState);
            break;
          case Direction.Left:
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

      // console.log(`done = ${tempDone}`);

      // check values of done and reward based on current square
      if (!tempDone) {
        // console.log(`square before move ${currentSquare}`);
        // Move
        newState = Move(currentSquare, action);
        // console.log(
        //   `Step: .Move(${Direction[action]}) | obs_space=${newState}`
        // );
        // console.log(`square after move ${newState}`);
        let letter = map[newState];
        if ("HG".includes(letter)) {
          tempDone = true;
          setDone(tempDone);
        }

        if ("G".includes(letter)) {
          reward = 1; // positive reward for reaching goal
        } else if ("H".includes(letter)) {
          reward = -1; // negative reward for falling in a hole
        }

        if (newState === currentSquare) {
          reward = -1; // negative reward for going off map
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

  // /**
  //  * triggers on change in 'done', and calls for a Reset of the Enviroment, and by extension the Agent too.
  //  */
  // useEffect(() => {
  //   if (done) {
  //     console.log(" done effect");
  //     // Reset();
  //   }
  // }, [done]);

  return (
    <div className="map-wrapper">
      {map.map((v, i) => {
        let className = `map-square ${v}`;
        if (i === currentSquare) {
          className += ` selected`;
        }
        return <div key={i} className={className} id={`map-square-${i}`}></div>;
      })}
      <div>
        <TestAgent
          step={Step}
          action_space={action_space}
          observation_space={observation_space}
          done={done}
          reset={Reset}
        />
      </div>
    </div>
  );
};

export default FrozenLake;
