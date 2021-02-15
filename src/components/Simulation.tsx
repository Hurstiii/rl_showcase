/**
 * Component that will decide on the layout and act as a parent of both the Environment and Agent.
 * This will be where the agent and environment will be decided upon and created.
 *
 * Simulation will hold the state for both and pass it down, recieving changes and updates through set{the state} callbacks.
 */

import React, { useCallback, useState } from "react";
import styled from "styled-components";
import FrozenLake from "./FrozenLake";
import TestAgent from "./TestAgent";
import { makeStyles } from "@material-ui/core/styles";
import {
  IconButton,
  Container,
  Divider,
  Paper,
  Typography,
  Input,
  Slider,
  TextField,
} from "@material-ui/core";
import { PlayArrowRounded, FastForwardRounded } from "@material-ui/icons";

const SimulationBase = styled.div`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
`;

const useStyles = makeStyles({
  section: {
    flexGrow: 1,
    display: "flex",
  },
  aside: {
    margin: "1rem",
    flexGrow: 1,
    padding: "1rem",
    flexDirection: "column",
    borderRadius: 0,
  },
  right: {
    border: "solid 1px #d9d9d9",
    minWidth: "fit-content",
    justifySelf: "end",
  },
  left: {
    border: "solid 1px #d9d9d9",
    minWidth: "fit-content",
    "& h2": {
      textAlign: "center",
    },
  },
  main: {
    flexShrink: 0,
    flexGrow: 3,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    minWidth: "400px",
  },
  valuesContainer: {
    padding: "1rem",
  },
  container: {
    display: "flex",
    padding: "1em",
  },
  playbackContainer: {
    justifyContent: "center",
  },
  variablesContainer: {
    flexDirection: "column",
  },
});

export interface Props {}

export const Simulation: React.FC<Props> = ({}) => {
  const classes = useStyles();
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
  const [envSpeed, setEnvSpeed] = useState(150);
  const [selectedSquare, setSelectedSquare] = useState(0);
  const [agentLearningRate, setAgentLearningRate] = useState(0.1);
  const [agentEpsilon, setAgentEpsilon] = useState(0.2);
  const [agentDiscount, setAgentDiscount] = useState(0.9);
  const [agentN, setAgentN] = useState(5);
  const [agentInit, setAgentInit] = useState<(() => void) | undefined>(
    undefined
  );

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

  const handleFullReset = useCallback(() => {
    setT(Infinity);
    set_t(0);
    setEpisodes(0);
    setTau(0);
    setS([0]);
    setA([0]);
    setR([]);
    setQ(new Map<string, number>());
    setPi(new Map<string, number>());
    if (envReset) envReset();
    if (agentInit) agentInit();
  }, [agentInit, envReset]);

  return (
    <SimulationBase>
      <Paper className={`${classes.aside} ${classes.left} ${classes.section}`}>
        <Container className={`${classes.valuesContainer}`} maxWidth="md">
          <Typography variant="h4" component="h2">
            Algorithmic Values
          </Typography>
          <Typography>ep={episodes}</Typography>
          <Typography>t={t}</Typography>
          <Typography>tau={tau}</Typography>
          <Typography>T={T}</Typography>
        </Container>
        <Divider />
        <Container className={`${classes.valuesContainer}`} maxWidth="md">
          <Typography variant="h4" component="h2">
            Square Values
          </Typography>
          <Typography>Selected State = {selectedSquare}</Typography>
          <Typography component="p">
            Q({selectedSquare}, 0) = {Q.get(`${selectedSquare},0`)?.toFixed(4)}
          </Typography>
          <Typography component="p">
            Q({selectedSquare}, 1) = {Q.get(`${selectedSquare},1`)?.toFixed(4)}
          </Typography>
          <Typography component="p">
            Q({selectedSquare}, 2) = {Q.get(`${selectedSquare},2`)?.toFixed(4)}
          </Typography>
          <Typography component="p">
            Q({selectedSquare}, 3) = {Q.get(`${selectedSquare},3`)?.toFixed(4)}
          </Typography>
          <br />
          <Typography component="p">
            pi({selectedSquare}, 0) ={" "}
            {pi.get(`${selectedSquare},0`)?.toFixed(4)}
          </Typography>
          <Typography component="p">
            pi({selectedSquare}, 1) ={" "}
            {pi.get(`${selectedSquare},1`)?.toFixed(4)}
          </Typography>
          <Typography component="p">
            pi({selectedSquare}, 2) ={" "}
            {pi.get(`${selectedSquare},2`)?.toFixed(4)}
          </Typography>
          <Typography component="p">
            pi({selectedSquare}, 3) ={" "}
            {pi.get(`${selectedSquare},3`)?.toFixed(4)}
          </Typography>
        </Container>
      </Paper>
      <main className={`${classes.section} ${classes.main}`}>
        <FrozenLake
          setStep={setEnvStep}
          setActionSpace={setEnvActionSpace}
          setStateSpace={setEnvStateSpace}
          setReset={setEnvReset}
          speed={envSpeed}
          setSelectedSquare={setSelectedSquare}
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
            n={agentN}
            alpha={agentLearningRate}
            epsilon={agentEpsilon}
            discount={agentDiscount}
            setAgentInit={setAgentInit}
            /** Used by Agent to decide what happens when a step is pressed and when simulate is pressed?
             * TODO: Might want to bring them out ??
             */
            setHandleStep={setHandleStep}
            setHandleSimulate={setHandleSimulate}
          />
        )}
      </main>
      <Paper className={`${classes.aside} ${classes.right} ${classes.section}`}>
        <Container
          className={`${classes.playbackContainer} ${classes.container}`}
        >
          <IconButton onClick={handleStep}>
            <PlayArrowRounded fontSize="large" />
          </IconButton>
          <IconButton onClick={handleSimulate}>
            <FastForwardRounded fontSize="large" />
          </IconButton>
        </Container>
        <Divider />
        <Container
          className={`${classes.variablesContainer} ${classes.container}`}
        >
          <Typography variant="h4">Algorithmic Variables</Typography>
          <Typography id="learning-rate-slider" gutterBottom>
            Learning Rate
          </Typography>
          <Slider
            aria-labelledby="learning-rate-slider"
            defaultValue={agentLearningRate}
            min={0}
            max={1}
            step={0.05}
            value={agentLearningRate}
            onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
              if (typeof v === "number") {
                setAgentLearningRate(v);
              }
            }}
            onChangeCommitted={() => {
              handleFullReset();
            }}
            valueLabelDisplay="auto"
          ></Slider>
          <Typography id="epsilon-slider" gutterBottom>
            Epsilon
          </Typography>
          <Slider
            aria-labelledby="epsilon-slider"
            defaultValue={agentEpsilon}
            min={0}
            max={1}
            step={0.05}
            value={agentEpsilon}
            onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
              if (typeof v === "number") {
                setAgentEpsilon(v);
              }
            }}
            onChangeCommitted={() => {
              handleFullReset();
            }}
            valueLabelDisplay="auto"
          ></Slider>
          <Typography id="n-slider" gutterBottom>
            n-steps
          </Typography>
          <Slider
            aria-labelledby="n-slider"
            defaultValue={agentN}
            min={0}
            max={10}
            step={1}
            value={agentN}
            onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
              if (typeof v === "number") {
                setAgentN(v);
              }
            }}
            onChangeCommitted={() => {
              handleFullReset();
            }}
            valueLabelDisplay="auto"
          ></Slider>
          <Typography id="discount-slider" gutterBottom>
            Discount
          </Typography>
          <Slider
            aria-labelledby="discount-slider"
            defaultValue={agentDiscount}
            min={0}
            max={1}
            step={0.05}
            value={agentDiscount}
            onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
              if (typeof v === "number") {
                setAgentDiscount(v);
              }
            }}
            onChangeCommitted={() => {
              handleFullReset();
            }}
            valueLabelDisplay="auto"
          ></Slider>
        </Container>
      </Paper>
    </SimulationBase>
  );
};

export default Simulation;
