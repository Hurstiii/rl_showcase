import React, { Ref } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import Environment from "./Environment";
import { sampleUniformAction } from "../utils/Utils";
import { Box, Hidden, makeStyles, Tooltip } from "@material-ui/core";
import { relative } from "path";

/**
 * Enum actions for the environment to given them more readability/meaning than just numbers.
 */
enum Actions {
  Up,
  Right,
  Down,
  Left,
}

const SquareSize = 150;
const AgentSize = SquareSize / 2;
const InfoSize = 38;

/**
 * Styled components.
 */
const MapWrapper = styled.div`
  display: grid;
  grid: repeat(4, ${SquareSize}px) / repeat(4, ${SquareSize}px);
  align-items: center;
  justify-items: center;
`;
const MapSquare = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all ease-out 0.15s;
  ${({
    type,
    selected,
  }: {
    type: "Hole" | "Ice" | "Goal";
    selected: boolean;
  }) => {
    var background;
    if (type === "Hole") background = "#457b9d";
    else if (type === "Goal") background = "#e3b23c";
    else background = "#a8dadc";

    return css`
      ${background ? `background: ${background}` : ``};
      ${selected
        ? `box-shadow: -7px 7px 1px -1px rgba(0, 0, 0, 0.1); width: 95%; height: 95%;`
        : `box-shadow: -5px 5px 1px -1px rgba(0, 0, 0, 0.1); width: 90%; height: 90%;`}
    `;
  }};
`;

const useStyles = makeStyles({
  InfoBubble: {
    width: `${InfoSize}px`,
    height: `${InfoSize}px`,
    background: "#ffffff66",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "0.8rem",
    fontWeight: 300,
  },
  InfoBox: {
    position: "absolute",
    justifyContent: "center",
    display: "flex",
    overflow: "hidden",
    transition: "opacity 0.5s ease,left 0.1s ease-in-out, top 0.1s ease-in-out",
  },
  InfoBoxHorizontal: {
    maxWidth: `${SquareSize}px`,
    width: `${SquareSize}px`,
    height: `${InfoSize}px`,
    flexDirection: "row",
  },
  InfoBoxVertical: {
    maxHeight: `${SquareSize}px`,
    height: `${SquareSize}px`,
    width: `${InfoSize}px`,
    flexDirection: "column",
  },
});

/**
 * Props for the FrozenLake environment.
 */
interface Props {
  mapSize?: 4;
  p?: number;
  isSlippery?: boolean;
  setStep: React.Dispatch<
    React.SetStateAction<
      ((action: number) => [number, number, boolean, Object]) | undefined
    >
  >;
  setActionSpace: React.Dispatch<React.SetStateAction<number[] | undefined>>;
  setStateSpace: React.Dispatch<React.SetStateAction<number[] | undefined>>;
  setReset: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  speed: number;
  setSelectedSquare: React.Dispatch<React.SetStateAction<number>>;
  extraSquareInfo: {
    up: {
      label: string;
      value: string | undefined;
    }[];
    right: {
      label: string;
      value: string | undefined;
    }[];
    down: {
      label: string;
      value: string | undefined;
    }[];
    left: {
      label: string;
      value: string | undefined;
    }[];
  };
  currentSquare: number;
  setCurrentSquare: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * The FrozenLake environment.
 * @param props Object of props
 */
const FrozenLake: React.FC<Props> = ({
  mapSize = 4,
  isSlippery = false,
  setStep,
  setActionSpace,
  setStateSpace,
  setReset,
  speed,
  setSelectedSquare,
  extraSquareInfo,
  currentSquare,
  setCurrentSquare,
}) => {
  const classes = useStyles();

  const action_space = useMemo(() => [0, 1, 2, 3], []); // all possible actions
  //prettier-ignore
  const observation_space = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], []) // all possible states

  const [localSelectedSquare, setLocalSelectedSquare] = useState(0);
  const [hideExtraInfo, setHideExtraInfo] = useState(false);

  // prettier-ignore
  const map = useMemo(() => ['F', 'F', 'F', 'F',
                'F', 'H', 'H', 'H',
                'F', 'F', 'F', 'F',
                'F', 'F', 'F', 'G'], [])
  const [done, setDone] = useState(false);

  // console.log("FrozenLake re-rendered");

  const [agentAnimDuraction, setAgentAnimDuration] = useState(0.1);

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
      /**
       * Chance to take a different action if environment is slippery.
       */
      if (isSlippery) {
        console.log(`Slippery action choice`);
        let actions = [
          (action - 1) % action_space.length,
          action,
          (action + 1) % action_space.length,
        ];
        action = sampleUniformAction(actions);
      }

      var newState = square;
      /**
       * Make move.
       */
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
    [isSlippery, InMap, action_space.length, mapSize, setCurrentSquare]
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
  const Reset = useCallback(() => {
    console.log(`-------- Resetting the Enviroment -----------`);
    setCurrentSquare(0);
    setDone(false);
  }, []);

  useEffect(() => {
    setAgentAnimDuration(speed / 1000);
  }, [speed]);

  /**
   * Pass values back to the parent with callbacks and state for the agent.
   */
  useEffect(() => {
    setActionSpace(action_space);
  }, [action_space, setActionSpace]);

  useEffect(() => {
    setStateSpace(observation_space);
  }, [observation_space, setStateSpace]);

  useEffect(() => {
    setStep(() => Step);
  }, [Step, setStep]);

  useEffect(() => {
    setReset(() => Reset);
  }, [Reset, setReset]);

  const getRandomDelay = () => {
    return Math.random() * 0.0;
  };

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
          position: "relative",
          height: "max-content",
        }}
      >
        <MapWrapper>
          {map.map((v, i) => {
            if (v === "H")
              return (
                <MapSquare
                  key={i}
                  type="Hole"
                  onClick={() => {
                    if (localSelectedSquare === i) {
                      setHideExtraInfo((hideExtraInfo) => !hideExtraInfo);
                    } else {
                      setHideExtraInfo(false);
                      setSelectedSquare(i);
                      setLocalSelectedSquare(i);
                    }
                  }}
                  selected={localSelectedSquare === i}
                />
              );
            else if (v === "G")
              return (
                <MapSquare
                  key={i}
                  type="Goal"
                  onClick={() => {
                    if (localSelectedSquare === i) {
                      setHideExtraInfo((hideExtraInfo) => !hideExtraInfo);
                    } else {
                      setHideExtraInfo(false);
                      setSelectedSquare(i);
                      setLocalSelectedSquare(i);
                    }
                  }}
                  selected={localSelectedSquare === i}
                />
              );
            else
              return (
                <MapSquare
                  key={i}
                  type="Ice"
                  onClick={() => {
                    if (localSelectedSquare === i) {
                      setHideExtraInfo((hideExtraInfo) => !hideExtraInfo);
                    } else {
                      setHideExtraInfo(false);
                      setSelectedSquare(i);
                      setLocalSelectedSquare(i);
                    }
                  }}
                  selected={localSelectedSquare === i}
                />
              );
          })}
        </MapWrapper>
        <div
          id="Agent"
          style={{
            width: `${AgentSize}px`,
            height: `${AgentSize}px`,
            background: "red",
            borderRadius: "50%",
            transitionProperty: "all",
            transitionDuration: `${agentAnimDuraction}s`,
            transitionTimingFunction: "ease",
            position: "absolute",
            boxShadow: "-5px 5px 1px -1px rgba(0, 0, 0, 0.2)",
            left: `${
              (currentSquare - Math.floor(currentSquare / mapSize) * mapSize) *
                SquareSize +
              AgentSize / 2
            }px`,
            top: `${
              Math.floor(currentSquare / mapSize) * SquareSize + AgentSize / 2
            }px`,
          }}
        ></div>
        <Box
          id="ValuesUp"
          className={`${classes.InfoBoxHorizontal} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              (localSelectedSquare -
                Math.floor(localSelectedSquare / mapSize) * mapSize) *
              SquareSize
            }px`,
            top: `${
              -28 + Math.floor(localSelectedSquare / mapSize) * SquareSize
            }px`,
            transitionDelay: `${getRandomDelay()}s`,
          }}
        >
          {extraSquareInfo.up.map((obj, i) => {
            return (
              <Tooltip key={i} title={obj.label}>
                <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                  {obj.value}
                </div>
              </Tooltip>
            );
          })}
        </Box>
        <Box
          id="ValuesDown"
          className={`${classes.InfoBoxHorizontal} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              (localSelectedSquare -
                Math.floor(localSelectedSquare / mapSize) * mapSize) *
              SquareSize
            }px`,
            top: `${
              SquareSize +
              -15 +
              Math.floor(localSelectedSquare / mapSize) * SquareSize
            }px`,
            transitionDelay: `${getRandomDelay()}s`,
          }}
        >
          {extraSquareInfo.down.map((obj, i) => {
            return (
              <Tooltip key={i} title={obj.label}>
                <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                  {obj.value}
                </div>
              </Tooltip>
            );
          })}
        </Box>
        <Box
          id="ValuesRight"
          className={`${classes.InfoBoxVertical} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              SquareSize +
              -15 +
              (localSelectedSquare -
                Math.floor(localSelectedSquare / mapSize) * mapSize) *
                SquareSize
            }px`,
            top: `${Math.floor(localSelectedSquare / mapSize) * SquareSize}px`,
            transitionDelay: `${getRandomDelay()}s`,
          }}
        >
          {extraSquareInfo.right.map((obj, i) => {
            return (
              <Tooltip key={i} title={obj.label}>
                <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                  {obj.value}
                </div>
              </Tooltip>
            );
          })}
        </Box>
        <Box
          id="ValuesLeft"
          className={`${classes.InfoBoxVertical} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              -28 +
              (localSelectedSquare -
                Math.floor(localSelectedSquare / mapSize) * mapSize) *
                SquareSize
            }px`,
            top: `${Math.floor(localSelectedSquare / mapSize) * SquareSize}px`,
            transitionDelay: `${getRandomDelay()}s`,
          }}
        >
          {extraSquareInfo.left.map((obj, i) => {
            return (
              <Tooltip key={i} title={obj.label}>
                <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                  {obj.value}
                </div>
              </Tooltip>
            );
          })}
        </Box>
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
