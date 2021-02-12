import { useCallback, useEffect, useRef, useState } from "react";

export interface Props {
  newEpisode: () => void; // a callback to reset the agent for a new episode.
  init: () => void; // a callback to intialise the agent. Called onComponentDidMount.
  learn: () => boolean; // the main callback that will implement the aglorithm of the agent. Called when step button pressed etc...
  speed: number; // the delay between agent actions.
  simulating: boolean;
  setSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  episodes: number;
  setEpisodes: React.Dispatch<React.SetStateAction<number>>;
  setHandleStep: React.Dispatch<
    React.SetStateAction<((e: React.MouseEvent) => void) | undefined>
  >;
  setHandleSimulate: React.Dispatch<
    React.SetStateAction<((e: React.MouseEvent) => void) | undefined>
  >;
}

/**
 * A base Agent component that implements the UI and none algorithmic parts of the agent. Designed to be re-usable for different agents.
 * @param props The props needed for a base Agent.
 */
export const Agent: React.FC<Props> = ({
  newEpisode,
  init,
  learn,
  speed,
  simulating,
  setSimulating,
  episodes,
  setEpisodes,
  setHandleStep,
  setHandleSimulate,
}) => {
  const interval = useRef<NodeJS.Timeout | null>(null); // remembers the interval that was set.

  /**
   * Handles a click of the step button.
   * @param e MouseEvent of the click.
   */
  const handleSimulate = useCallback(
    (e: React.MouseEvent) => {
      let newSimulating = !simulating;
      setSimulating(newSimulating);
    },
    [setSimulating, simulating]
  );

  /**
   * Handles the click of the simulate button.
   * @param e MouseEvent of the click.
   */
  const handleStep = useCallback(
    (e: React.MouseEvent) => {
      if (simulating) return;
      if (learn()) {
        newEpisode();
        setEpisodes(episodes + 1);
      }
    },
    [episodes, learn, newEpisode, setEpisodes, simulating]
  );

  /**
   * basically onComponentDidMount
   */
  useEffect(() => {
    console.log("init Effect ----------------------------------");
    init();
  }, []);

  /**
   * Handles setting and clearing the interval for the simulation.
   */
  useEffect(() => {
    if (simulating) {
      interval.current = setInterval(() => {
        if (learn()) {
          if (simulating) {
            newEpisode();
            setEpisodes(episodes + 1);
          }
        }
      }, speed);

      return () => {
        if (interval.current !== null) {
          clearInterval(interval.current);
        }
      };
    }
  }, [simulating, learn, speed, newEpisode, episodes, setEpisodes]);

  useEffect(() => {
    setHandleStep(() => handleStep);
  }, [setHandleStep, handleStep]);

  useEffect(() => {
    setHandleSimulate(() => handleSimulate);
  }, [setHandleSimulate, handleSimulate]);

  return <></>;
};

export default Agent;
