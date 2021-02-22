import React, { useCallback, useEffect, useState } from "react";
import Agent from "./Agent";
import { sampleUniformAction, randomChoice } from "../utils/Utils";
import {
  Container,
  Divider,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";

export interface TestAgentState {
  t: number;
  tau: number;
  T: number;
  A: number[];
  S: number[];
  R: number[];
  Q: Map<string, number>;
  pi: Map<string, number>;
}

export interface Props {
  step: (action: number) => [number, number, boolean, Object];
  action_space: number[];
  state_space: number[];
  reset: Function;
  speed: number;
  // t: number;
  // set_t: React.Dispatch<React.SetStateAction<number>>;
  // T: number;
  // setT: React.Dispatch<React.SetStateAction<number>>;
  // tau: number;
  // setTau: React.Dispatch<React.SetStateAction<number>>;
  // Q: Map<string, number>;
  // updateQ: (k: string, v: number) => void;
  // pi: Map<string, number>;
  // updatePi: (k: string, v: number) => void;
  // A: number[];
  // setA: React.Dispatch<React.SetStateAction<number[]>>;
  // S: number[];
  // setS: React.Dispatch<React.SetStateAction<number[]>>;
  // R: number[];
  // setR: React.Dispatch<React.SetStateAction<number[]>>;
  agentState: TestAgentState;
  setAgentState: React.Dispatch<React.SetStateAction<TestAgentState>>;
  simulating: boolean;
  setSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  episodes: number;
  setEpisodes: React.Dispatch<React.SetStateAction<number>>;
  n: number;
  epsilon: number;
  discount: number;
  alpha: number;
  setAgentInit: React.Dispatch<
    React.SetStateAction<((context?: TestAgentState) => void) | undefined>
  >;
  setHandleStep: React.Dispatch<
    React.SetStateAction<((e: React.MouseEvent) => void) | undefined>
  >;
  setHandleSimulate: React.Dispatch<
    React.SetStateAction<((e: React.MouseEvent) => void) | undefined>
  >;
}

const TestAgent: React.FC<Props> = (props) => {
  const AS = props.action_space;
  const SS = props.state_space;
  const Step = props.step; // Step callback of the environment.
  const Reset = props.reset; // Reset callback of the environment.
  const speed = props.speed;

  const {
    simulating,
    setSimulating,
    episodes,
    setEpisodes,
    setHandleStep,
    setHandleSimulate,
    n,
    epsilon,
    discount,
    alpha,
    setAgentInit,
  } = props;

  // const {
  //   t,
  //   set_t,
  //   T,
  //   setT,
  //   tau,
  //   setTau,
  //   Q,
  //   updateQ,
  //   pi,
  //   updatePi,
  //   A,
  //   R,
  //   S,
  //   setA,
  //   setR,
  //   setS,
  // } = props;

  const { agentState, setAgentState } = props;

  /**
   * Util function
   *
   * Used to update the policy to be epsilon-greedy w.r.t Q
   */
  const updateGreedyPi = useCallback(
    (Q: Map<string, number>, pi: Map<string, number>): Map<string, number> => {
      const tempPi = new Map(pi);

      SS.forEach((s, i) => {
        /**
         * Find all argmax-a Q(s, a)
         */
        var bestActions: number[] = [];
        var bestValue = Q.get(`${s},0`);
        AS.forEach((a, ii) => {
          let currentValue = Q.get(`${s},${a}`);
          if (currentValue === undefined)
            throw Error(
              `Undefined currentValue Q([${s},${a}] ${currentValue})`
            );
          if (bestValue === undefined)
            throw Error(`Undefined bestValue Q([${s},0]) ${bestValue}`);
          if (currentValue === bestValue) {
            bestActions.push(a);
            bestValue = currentValue;
          } else if (currentValue > bestValue) {
            bestActions = [a];
            bestValue = currentValue;
          }
        });

        /**
         * Break ties randomly i.e. choose a random action from bestActions
         */
        var bestAction: number = sampleUniformAction(bestActions);

        /**
         * Set pi to be epsilon-greedy
         */
        AS.forEach((a, ii) => {
          if (a === bestAction) {
            tempPi.set(`${s},${a}`, 1 - epsilon + epsilon / AS.length);
          } else {
            tempPi.set(`${s},${a}`, epsilon / AS.length);
          }
        });
      });

      // console.log("Q = ");
      // console.log(Q);
      return tempPi;
    },
    [AS, SS, epsilon]
  );

  /**
   * Util function
   *
   * Used to get an action at state s using the agents policy.
   * @param s The state to get can action for.
   * @param pi The policy used to decide on an action.
   */
  const piAction = useCallback(
    (s: number, pi: Map<string, number>) => {
      let weights = AS.map((a) => {
        let weight = pi.get(`${s},${a}`);
        if (weight === undefined)
          throw Error(`Undefined weight from pi.get(${s},${a})`);
        return weight;
      });
      return randomChoice(weights);
    },
    [AS]
  );

  /**
   * Required for Agent
   *
   * Used to initialize any values the agent needs.
   */
  const init = useCallback(
    (context: TestAgentState = agentState) => {
      const tempQ = new Map(context.Q);
      SS.forEach((s, i) => {
        /**
         * Set Q(s, a) to arbitrary values.
         */
        AS.forEach((a, ii) => {
          tempQ.set(`${s},${a}`, 0);
        });
      });

      /**
       * Set pi to be greedy w.r.t Q.
       */
      const tempPi = updateGreedyPi(tempQ, context.pi);

      /**
       * TODO: Check if piAction is using the values set just above?
       */

      const S = [0];
      const A = [piAction(S[0], tempPi)];
      const R = [0];

      setAgentState({
        ...context,
        T: Infinity,
        t: 0,
        tau: 0,
        Q: tempQ,
        pi: tempPi,
        S: S,
        A: A,
        R: R,
      });
    },
    [AS, SS, agentState, setAgentState, piAction, updateGreedyPi]
  );

  useEffect(() => {
    setAgentInit(() => init);
  }, [init, setAgentInit]);

  /**
   * Required for Agent
   *
   * A callback used to reset the agent for a new episode.
   */
  const newEpisode = useCallback(
    (context: TestAgentState) => {
      console.log("new Episode Effect ----------------------------------");
      setAgentState({
        ...context,
        T: Infinity,
        t: 0,
        tau: 0,
        S: [0],
        A: [piAction(0, agentState.pi)],
        R: [0],
      });
      // add delay to give it time to be seen on last square before resetting.
      setTimeout(() => {
        Reset();
      }, speed);
    },
    [Reset, agentState, piAction, setAgentState, speed]
  );

  /**
   * Required for an Agent
   *
   * Implements one time step of the agents learning algorithm.
   * @returns { done, context }
   * done: whether the learning has terminated,
   * context: the agents new state after this learning step, to be used in following functions to avoid race conditions on agentState
   */
  const learn = useCallback(() => {
    let {t, T, tau, A, S, R, Q, pi} = agentState;
    A = [...A];
    S = [...S];
    R = [...R];
    Q = new Map(Q);

    if (t < T) {
      let [obs, rew, localDone] = Step(A[t % (n + 1)]);
      S[(t + 1) % (n + 1)] = obs;
      R[(t + 1) % (n + 1)] = rew;

      if (localDone) {
        T = t + 1;
      } else {
        A[(t + 1) % (n + 1)] = piAction(obs, pi);
      }
    }
    tau = t - n + 1;
    if (tau >= 0) {
      let G = 0;
      for (let i = tau + 1; i <= Math.min(tau + n, T); i++) {
        G = G + Math.pow(discount, i - tau - 1) * R[i % (n + 1)];
      }
      if (tau + n < T) {
        let currentState = S[(tau + n) % (n + 1)];
        let currentAction = A[(tau + n) % (n + 1)];
        let stateValue = Q.get(`${currentState},${currentAction}`);
        if (stateValue === undefined) {
          throw Error(
            `state value is undefined for Q.get(${currentState},${currentAction})`
          );
        }
        G += Math.pow(discount, n) * stateValue;
      }
      let updatedStateValue = Q.get(
        `${S[tau % (n + 1)]},${A[tau % (n + 1)]}`
      );
      if (updatedStateValue === undefined) {
        throw Error(
          `undefined for Q.get ${S[tau % (n + 1)]},${
            A[tau % (n + 1)]
          }`
        );
      }
      updatedStateValue += alpha * (G - updatedStateValue);
      Q.set(
        `${S[tau % (n + 1)]},${A[tau % (n + 1)]}`,
        updatedStateValue
      );
      pi = updateGreedyPi(Q, pi);
    }
    if (tau === T - 1) {
      console.log(`Reached a terminal state returning true`);
      const newState = {...agentState, t: t, T: T, tau: tau, S: S, R: R, A: A, Q: Q, pi: pi};
      console.log(newState);
      setAgentState(newState);
      return {done: true, context: newState};
    }
    const newState = {...agentState, t: t+1, T: T, tau: tau, S: S, R: R, A: A, Q: Q, pi: pi};
    setAgentState(newState);    
    return {done: false, context: newState};
  }, [agentState, n, setAgentState, Step, piAction, alpha, updateGreedyPi, discount]); //prettier-ignore

  return (
    <Agent
      newEpisode={newEpisode}
      init={init}
      learn={learn}
      speed={speed}
      simulating={simulating}
      setSimulating={setSimulating}
      episodes={episodes}
      setEpisodes={setEpisodes}
      setHandleStep={setHandleStep}
      setHandleSimulate={setHandleSimulate}
    ></Agent>
  );
};

export default TestAgent;
