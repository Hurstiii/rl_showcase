import { Box, Card, Container } from "@material-ui/core";
import React from "react";

export interface Props {
  action_space: number[]; // All possible actions.
  state_space: number[]; // All possible states.
  Step: (action: number) => [obs: number, rew: number, done: boolean, info: {}]; // a callback function to take an action on the environment and see new state.
  Reset: () => void; // a callback to reset the environment, will be called when the agent has finished and environment is done.
  speed: number; // the delay between agent moves / speed of the simulation.
}

/**
 * A base Environment that is designed to be re-usable for different environments.
 * @param props The props needed for the base Environment.
 * @param children Use children to render the visuals for the environment.
 */
export const Environment: React.FC<Props> = ({
  action_space,
  state_space,
  Step,
  Reset,
  speed,
  children,
}) => {
  return <>{children}</>;
};

export default Environment;
