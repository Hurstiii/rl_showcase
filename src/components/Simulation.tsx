/**
 * Component that will decide on the layout and act as a parent of both the Environment and Agent.
 * This will be where the agent and environment will be decided upon and created.
 *
 * Simulation will hold the state for both and pass it down, recieving changes and updates through set{the state} callbacks.
 */

import { useCallback, useState } from "react";
import FrozenLake from "./FrozenLake";
import TestAgent from "./TestAgent";

export interface Props {}

export const Simulation: React.FC<Props> = ({}) => {
  const [envStep, setEnvStep] = useState<
    ((action: number) => [number, number, boolean, Object]) | undefined
  >(undefined);
  const [envActionSpace, setEnvActionSpace] = useState<number[] | undefined>(
    undefined
  );
  const [envStateSpace, setEnvStateSpace] = useState<number[] | undefined>(
    undefined
  );
  const [envReset, setEnvReset] = useState<(() => void) | undefined>(undefined);
  const [envSpeed, setEnvSpeed] = useState(100);

  /**
   * State used for the learning algorithm.
   */
  const [Q, setQ] = useState(new Map<string, number>()); // Q(s, a) -> estimated state value
  const updateQ = useCallback(
    (k: string, v: number) => {
      setQ(new Map(Q.set(k, v)));
    },
    [Q]
  );
  const [pi, setPi] = useState(new Map<string, number>()); // pi(s) -> action
  const updatePi = useCallback(
    (k: string, v: number) => {
      setPi(new Map(pi.set(k, v)));
    },
    [pi]
  );
  const [t, set_t] = useState(0); // time step agent is on.
  const [tau, setTau] = useState(0); // tau (step which the agent is updating).
  const [T, setT] = useState(Infinity); // Termination (step at which the agent terminated)
  const [S, setS] = useState<number[]>([]); // state memory
  const [A, setA] = useState<number[]>([]); // action memory
  const [R, setR] = useState<number[]>([]); // reward memory

  const [episodes, setEpisodes] = useState<number>(1);
  const [simulating, setSimulating] = useState(false); // whether the environment is simulating or not.
  const [handleSimulate, setHandleSimulate] = useState<
    ((e: React.MouseEvent) => void) | undefined
  >(undefined);
  const [handleStep, setHandleStep] = useState<
    ((e: React.MouseEvent) => void) | undefined
  >(undefined);

  const handleSpeedChange = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (e.currentTarget.id === "increase-speed") {
      console.log(`increasing speed`);
      setEnvSpeed(envSpeed + 20);
    } else if (e.currentTarget.id === "decrease-speed") {
      console.log(`decreasing speed`);
      setEnvSpeed(envSpeed - 20);
    }
  };

  return (
    <div>
      <FrozenLake
        setStep={setEnvStep}
        setActionSpace={setEnvActionSpace}
        setStateSpace={setEnvStateSpace}
        setReset={setEnvReset}
        speed={envSpeed}
      />
      {envStep && envActionSpace && envStateSpace && envReset && (
        <TestAgent
          /**
           * TODO: find a way to condense the props, maybe into groups of props (Objects containing related props?)
           */
          /** state variables from environment. Connects the agent to the environment. */
          step={envStep}
          action_space={envActionSpace}
          state_space={envStateSpace}
          reset={envReset}
          /** Simulation state variables, used by the agent. Brought out into parent so the parent can display them elsewhere. */
          speed={envSpeed}
          t={t}
          set_t={set_t}
          T={T}
          setT={setT}
          tau={tau}
          setTau={setTau}
          Q={Q}
          updateQ={updateQ}
          pi={pi}
          updatePi={updatePi}
          S={S}
          setS={setS}
          A={A}
          setA={setA}
          R={R}
          setR={setR}
          simulating={simulating}
          setSimulating={setSimulating}
          episodes={episodes}
          setEpisodes={setEpisodes}
          /** Used by Agent to decide what happens when a step is pressed and when simulate is pressed?
           * TODO: Might want to bring them out ??
           */
          setHandleStep={setHandleStep}
          setHandleSimulate={setHandleSimulate}
        />
      )}
      <div>
        <button onClick={handleStep}>Step</button>
        <button onClick={handleSimulate}>Simulate</button>
        <h2>ep={episodes}</h2>
        <h2>t={t}</h2>
      </div>
    </div>
  );
};

export default Simulation;
