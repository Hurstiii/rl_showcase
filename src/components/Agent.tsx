import { useCallback, useEffect, useRef, useState } from "react";
import { TestAgentState } from "./TestAgent";

export interface Props {
  newEpisode: (context: TestAgentState) => void; // a callback to reset the agent for a new episode.
  init: () => void; // a callback to intialise the agent. Called onComponentDidMount.
  learn: () => { done: boolean; context: TestAgentState }; // the main callback that will implement the aglorithm of the agent. Called when step button pressed etc...
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
  children,
}) => {
  const interval = useRef<NodeJS.Timeout | null>(null); // remembers the interval that was set.
  const intervals = useRef(0);

  /**
   * Handles a click of the step button.
   * @param e MouseEvent of the click.
   */
  const handleSimulate = useCallback(
    (e: React.MouseEvent) => {
      setSimulating((simulating) => !simulating);
    },
    [setSimulating]
  );

  /**
   * Handles the click of the simulate button.
   * @param e MouseEvent of the click.
   */
  const handleStep = useCallback(
    (e: React.MouseEvent) => {
      if (simulating) return;
      const { done, context } = learn();
      if (done) {
        newEpisode(context);
        setEpisodes((episodes) => episodes + 1);
      }
    },
    [learn, newEpisode, setEpisodes, simulating]
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
      intervals.current += 1;
      // console.log(`Setting interval ${intervals.current}`);
      interval.current = setInterval(() => {
        const { done, context } = learn();
        if (done) {
          if (simulating) {
            newEpisode(context);
            setEpisodes((episodes) => episodes + 1);
          }
        }
      }, speed);

      return () => {
        if (interval.current !== null) {
          // console.log(`Clearing interval ${intervals.current}`);
          clearInterval(interval.current);
        }
      };
    }
  }, [simulating, learn, newEpisode, setEpisodes, speed]);

  useEffect(() => {
    setHandleStep(() => handleStep);
  }, [setHandleStep, handleStep]);

  useEffect(() => {
    setHandleSimulate(() => handleSimulate);
  }, [setHandleSimulate, handleSimulate]);

  return <>{children}</>;
};

export default Agent;
