import { useCallback, useEffect, useRef, useState } from "react";
import { TestAgentState } from "./TestAgent";

export interface Props {
  newEpisode: (context: TestAgentState) => TestAgentState; // a callback to reset the agent for a new episode.
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
  saveTimestepState: (context: TestAgentState, episode: number) => void;
  setWorkingTimestep: React.Dispatch<React.SetStateAction<number>>;
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
  saveTimestepState,
  setWorkingTimestep,
  children,
}) => {
  const interval = useRef<NodeJS.Timeout | null>(null); // remembers the interval that was set.

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

  const tickTimestep = useCallback(() => {
    const { done, context } = learn();
    if (done) {
      let newContext = newEpisode(context);
      let newEpisodes = episodes + 1;
      setEpisodes(newEpisodes);
      console.log("saving the initial state for the new episode");
      // saveTimestepState(newContext, newEpisodes, currentSquare);
      // setWorkingTimestep(0);
    } else {
      console.log("saving the state for a timestep");
      // saveTimestepState(context, episodes);
      // setWorkingTimestep(context.t);
    }
  }, [
    episodes,
    learn,
    newEpisode,
    saveTimestepState,
    setEpisodes,
    setWorkingTimestep,
  ]);

  /**
   * Handles the click of the simulate button.
   * @param e MouseEvent of the click.
   */
  const handleStep = useCallback(
    (e: React.MouseEvent) => {
      if (simulating) return;
      tickTimestep();
    },
    [simulating, tickTimestep]
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
        tickTimestep();
      }, speed);

      return () => {
        if (interval.current !== null) {
          clearInterval(interval.current);
        }
      };
    }
  }, [simulating, speed, tickTimestep]);

  useEffect(() => {
    setHandleStep(() => handleStep);
  }, [setHandleStep, handleStep]);

  useEffect(() => {
    setHandleSimulate(() => handleSimulate);
  }, [setHandleSimulate, handleSimulate]);

  return <>{children}</>;
};

export default Agent;
