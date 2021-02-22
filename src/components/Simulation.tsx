/**
 * Component that will decide on the layout and act as a parent of both the Environment and Agent.
 * This will be where the agent and environment will be decided upon and created.
 *
 * Simulation will hold the state for both and pass it down, recieving changes and updates through set{the state} callbacks.
 */
import React, { useCallback, useState } from "react";
import styled from "styled-components";
import FrozenLake from "./FrozenLake";
import TestAgent, { TestAgentState } from "./TestAgent";
import { makeStyles } from "@material-ui/core/styles";
import {
  IconButton,
  Divider,
  Paper,
  Typography,
  Input,
  Slider,
  Card,
  Grid,
  Box,
  Container,
} from "@material-ui/core";
import {
  PlayArrowRounded,
  FastForwardRounded,
  RefreshRounded,
  PauseRounded,
} from "@material-ui/icons";
import { AlgorithmValuesViewer } from "./AlgorithmValues";
import { SquareView } from "./SquareView";
import { red } from "@material-ui/core/colors";

const SimulationBase = styled.div`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
`;

export const useStyles = makeStyles({
  // section: {
  //   flexGrow: 1,
  //   display: "flex",
  // },
  // aside: {
  //   margin: "1rem",
  //   flexGrow: 1,
  //   padding: "1rem",
  //   flexDirection: "column",
  //   borderRadius: 0,
  // },
  // right: {
  //   border: "solid 1px #d9d9d9",
  //   minWidth: "fit-content",
  //   justifySelf: "end",
  // },
  // left: {
  //   border: "solid 1px #d9d9d9",
  //   minWidth: "fit-content",
  //   "& h2": {
  //     textAlign: "center",
  //   },
  // },
  main: {
    display: "flex",
    flexShrink: 0,
    flexGrow: 0,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "800px",
    minWidth: "800px",
  },
  leftColumn: {
    padding: "1em 2em",
    background: "rgba(256, 256, 256, 0.0)",
  },
  // valuesContainer: {
  //   padding: "1rem",
  // },
  // container: {
  //   display: "flex",
  //   padding: "1em",
  // },
  // playbackContainer: {
  //   justifyContent: "center",
  // },
  // variablesContainer: {
  //   flexDirection: "column",
  // },
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
  const [envSpeed, setEnvSpeed] = useState(100);
  const [selectedSquare, setSelectedSquare] = useState(0);
  const [agentLearningRate, setAgentLearningRate] = useState(0.1);
  const [agentEpsilon, setAgentEpsilon] = useState(0.2);
  const [agentDiscount, setAgentDiscount] = useState(0.9);
  const [agentN, setAgentN] = useState(5);
  const [agentInit, setAgentInit] = useState<
    ((context?: TestAgentState) => void) | undefined
  >(undefined);

  /**
   * State used for the learning algorithm.
   */

  const [agentState, setAgentState] = useState<TestAgentState>({
    t: 0,
    tau: 0,
    T: Infinity,
    S: [],
    R: [],
    A: [],
    Q: new Map<string, number>(),
    pi: new Map<string, number>(),
  });

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
    setEpisodes(0);
    if (envReset) envReset();
    if (agentInit) agentInit();
  }, [agentInit, envReset]);

  return (
    <SimulationBase>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
      >
        <AlgorithmValuesViewer
          values={[
            { key: "episodes", value: episodes },
            { key: "t", value: agentState.t },
            { key: "T", value: agentState.T },
            { key: "tau", value: agentState.tau },
          ]}
        />
        <SquareView
          selected={selectedSquare}
          Q={agentState.Q}
          pi={agentState.pi}
        />
      </Box>

      <main className={`${classes.main}`}>
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
            agentState={agentState}
            setAgentState={setAgentState}
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

      <Paper /**className={`${classes.aside} ${classes.right} ${classes.section}`}*/
      >
        <Box
        /**className={`${classes.playbackContainer} ${classes.container}`}*/
        >
          <IconButton onClick={handleFullReset} disabled={simulating}>
            <RefreshRounded fontSize="large" />
          </IconButton>
          <IconButton onClick={handleStep} disabled={simulating}>
            <PlayArrowRounded fontSize="large" />
          </IconButton>
          <IconButton onClick={handleSimulate}>
            {simulating ? (
              <PauseRounded fontSize="large" />
            ) : (
              <FastForwardRounded fontSize="large" />
            )}
          </IconButton>
        </Box>
        <Divider />
        <Box
        /**className={`${classes.variablesContainer} ${classes.container}`}*/
        >
          <Typography variant="h4">Algorithmic Variables</Typography>
          <Typography id="learning-rate-slider" gutterBottom>
            Learning Rate
          </Typography>

          <Slider
            disabled={simulating}
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
            color="secondary"
          ></Slider>
          <Typography id="epsilon-slider" gutterBottom>
            Epsilon
          </Typography>
          <Slider
            disabled={simulating}
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
            disabled={simulating}
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
            disabled={simulating}
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
        </Box>
      </Paper>
    </SimulationBase>
  );
};

export default Simulation;
