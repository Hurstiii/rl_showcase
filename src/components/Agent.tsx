import { useEffect, useRef, useState } from "react";

export interface Props {
  newEpisode: () => void; // a callback to reset the agent for a new episode.
  init: () => void; // a callback to intialise the agent. Called onComponentDidMount.
  learn: () => boolean; // the main callback that will implement the aglorithm of the agent. Called when step button pressed etc...
  speed: number; // the delay between agent actions.
  timeStep: number;
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
  timeStep,
}) => {
  const [simulating, setSimulating] = useState(false); // whether the environment is simulating or not.
  const interval = useRef<NodeJS.Timeout | null>(null); // remembers the interval that was set.
  const [episodes, setEpisodes] = useState(1); // number of episodes.

  /**
   * Handles a click of the step button.
   * @param e MouseEvent of the click.
   */
  const handleSimulate = (e: React.MouseEvent) => {
    let newSimulating = !simulating;
    setSimulating(newSimulating);
  };

  /**
   * Handles the click of the simulate button.
   * @param e MouseEvent of the click.
   */
  const handleStep = (e: React.MouseEvent) => {
    if (simulating) return;
    if (learn()) {
      newEpisode();
      setEpisodes(episodes + 1);
    }
  };

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
  }, [simulating, learn, speed, newEpisode, episodes]);

  return (
    <div>
      <button onClick={handleStep}>Step</button>
      <button onClick={handleSimulate}>Simulate</button>
      <h2>ep={episodes}</h2>
      <h2>t={timeStep}</h2>
    </div>
  );
};

export default Agent;
