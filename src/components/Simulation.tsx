/**
 * Component that will decide on the layout and act as a parent of both the Environment and Agent.
 * This will be where the agent and environment will be decided upon and created.
 *
 * Simulation will hold the state for both and pass it down, recieving changes and updates through set{the state} callbacks.
 */
import React, { useCallback, useEffect, useState } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import {
  PlayArrowRounded,
  FastForwardRounded,
  RefreshRounded,
  PauseRounded,
  ExpandMoreRounded,
} from "@material-ui/icons";
import { AlgorithmValuesViewer } from "./AlgorithmValues";
import { ColorValues as ThemeColors } from "./Theme";

const SimulationBase = styled.div`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
`;

// export const useStyles = makeStyles({

// });

export interface Props {}

export const Simulation: React.FC<Props> = ({}) => {
  // const classes = useStyles();
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

  const [envExtraSquareInfo, setEnvExtraSquareInfo] = useState({
    up: [
      {
        label: `Q(${selectedSquare},0)`,
        value: agentState.Q.has(`${selectedSquare},0`)
          ? agentState.Q.get(`${selectedSquare},0`)!.toFixed(2)
          : ``,
      },
      {
        label: `pi(${selectedSquare},0)`,
        value: agentState.pi.has(`${selectedSquare},0`)
          ? `${(agentState.pi.get(`${selectedSquare},0`)! * 100).toFixed(2)}%`
          : ``,
      },
    ],
    right: [
      {
        label: `Q(${selectedSquare},1)`,
        value: agentState.Q.has(`${selectedSquare},1`)
          ? agentState.Q.get(`${selectedSquare},1`)!.toFixed(2)
          : ``,
      },
      {
        label: `pi(${selectedSquare},1)`,
        value: agentState.pi.has(`${selectedSquare},1`)
          ? `${(agentState.pi.get(`${selectedSquare},1`)! * 100).toFixed(2)}%`
          : ``,
      },
    ],
    down: [
      {
        label: `Q(${selectedSquare},2)`,
        value: agentState.Q.has(`${selectedSquare},2`)
          ? agentState.Q.get(`${selectedSquare},2`)!.toFixed(2)
          : ``,
      },
      {
        label: `pi(${selectedSquare},2)`,
        value: agentState.pi.has(`${selectedSquare},2`)
          ? `${(agentState.pi.get(`${selectedSquare},2`)! * 100).toFixed(2)}%`
          : ``,
      },
    ],
    left: [
      {
        label: `Q(${selectedSquare},3)`,
        value: agentState.Q.has(`${selectedSquare},3`)
          ? agentState.Q.get(`${selectedSquare},3`)!.toFixed(2)
          : ``,
      },
      {
        label: `pi(${selectedSquare},3)`,
        value: agentState.pi.has(`${selectedSquare},3`)
          ? `${(agentState.pi.get(`${selectedSquare},3`)! * 100).toFixed(2)}%`
          : ``,
      },
    ],
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

  useEffect(() => {
    setEnvExtraSquareInfo({
      up: [
        {
          label: `Q(${selectedSquare},0)`,
          value: agentState.Q.has(`${selectedSquare},0`)
            ? agentState.Q.get(`${selectedSquare},0`)!.toFixed(2)
            : ``,
        },
        {
          label: `pi(${selectedSquare},0)`,
          value: agentState.pi.has(`${selectedSquare},0`)
            ? `${(agentState.pi.get(`${selectedSquare},0`)! * 100).toFixed(2)}%`
            : ``,
        },
      ],
      right: [
        {
          label: `Q(${selectedSquare},1)`,
          value: agentState.Q.has(`${selectedSquare},1`)
            ? agentState.Q.get(`${selectedSquare},1`)!.toFixed(2)
            : ``,
        },
        {
          label: `pi(${selectedSquare},1)`,
          value: agentState.pi.has(`${selectedSquare},1`)
            ? `${(agentState.pi.get(`${selectedSquare},1`)! * 100).toFixed(2)}%`
            : ``,
        },
      ],
      down: [
        {
          label: `Q(${selectedSquare},2)`,
          value: agentState.Q.has(`${selectedSquare},2`)
            ? agentState.Q.get(`${selectedSquare},2`)!.toFixed(2)
            : ``,
        },
        {
          label: `pi(${selectedSquare},2)`,
          value: agentState.pi.has(`${selectedSquare},2`)
            ? `${(agentState.pi.get(`${selectedSquare},2`)! * 100).toFixed(2)}%`
            : ``,
        },
      ],
      left: [
        {
          label: `Q(${selectedSquare},3)`,
          value: agentState.Q.has(`${selectedSquare},3`)
            ? agentState.Q.get(`${selectedSquare},3`)!.toFixed(2)
            : ``,
        },
        {
          label: `pi(${selectedSquare},3)`,
          value: agentState.pi.has(`${selectedSquare},3`)
            ? `${(agentState.pi.get(`${selectedSquare},3`)! * 100).toFixed(2)}%`
            : ``,
        },
      ],
    });
  }, [agentState.Q, agentState.pi, selectedSquare]);

  return (
    <SimulationBase>
      <Paper elevation={1} square={true}>
        <Accordion elevation={1} defaultExpanded={true} square={true}>
          <AccordionSummary expandIcon={<ExpandMoreRounded />}>
            <Typography variant="body1">Algorithm Variables</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box id="algorithm-variables-box" minWidth="300px">
              <Typography
                variant="body2"
                id="learning-rate-slider"
                gutterBottom
              >
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
              />
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
              />
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
              />
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
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
      <Box display="flex" flexDirection="row" padding="1em" flexGrow={1}>
        <Box
          display="flex"
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
        >
          <FrozenLake
            setStep={setEnvStep}
            setActionSpace={setEnvActionSpace}
            setStateSpace={setEnvStateSpace}
            setReset={setEnvReset}
            speed={envSpeed}
            setSelectedSquare={setSelectedSquare}
            extraSquareInfo={envExtraSquareInfo}
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
        </Box>
        <Box>
          <Box marginBottom="1em">
            <Paper style={{ background: ThemeColors.primary?.main }}>
              <Box display="flex" flexDirection="row" justifyContent="center">
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
            </Paper>
          </Box>
          <AlgorithmValuesViewer
            values={[
              { key: "episodes", value: episodes },
              { key: "t", value: agentState.t },
              { key: "T", value: agentState.T },
              { key: "tau", value: agentState.tau },
            ]}
          />
        </Box>
      </Box>
    </SimulationBase>
  );
};

export default Simulation;
