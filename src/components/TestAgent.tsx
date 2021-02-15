import React, { useCallback, useEffect, useState } from "react";
import Agent from "./Agent";
import { sampleUniformAction, randomChoice } from "../utils/Utils";

export interface Props {
  step: (action: number) => [number, number, boolean, Object];
  action_space: number[];
  state_space: number[];
  reset: Function;
  speed: number;
  t: number;
  set_t: React.Dispatch<React.SetStateAction<number>>;
  T: number;
  setT: React.Dispatch<React.SetStateAction<number>>;
  tau: number;
  setTau: React.Dispatch<React.SetStateAction<number>>;
  Q: Map<string, number>;
  updateQ: (k: string, v: number) => void;
  pi: Map<string, number>;
  updatePi: (k: string, v: number) => void;
  A: number[];
  setA: React.Dispatch<React.SetStateAction<number[]>>;
  S: number[];
  setS: React.Dispatch<React.SetStateAction<number[]>>;
  R: number[];
  setR: React.Dispatch<React.SetStateAction<number[]>>;
  simulating: boolean;
  setSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  episodes: number;
  setEpisodes: React.Dispatch<React.SetStateAction<number>>;
  n: number;
  epsilon: number;
  discount: number;
  alpha: number;
  setAgentInit: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
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
  //prettier-ignore
  const {speed, t, set_t, T, setT, tau, setTau, Q, updateQ, pi, updatePi, A, setA, S, setS, R, setR} = props;

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

  /**
   * Util function
   *
   * Used to update the policy to be epsilon-greedy w.r.t Q
   */
  const updateGreedyPi = useCallback(() => {
    SS.forEach((s, i) => {
      /**
       * Find all argmax-a Q(s, a)
       */
      var bestActions: number[] = [];
      var bestValue = Q.get(`${s},0`);
      AS.forEach((a, ii) => {
        let currentValue = Q.get(`${s},${a}`);
        if (currentValue === undefined)
          throw Error(`Undefined currentValue Q([${s},${a}] ${currentValue})`);
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
          updatePi(`${s},${a}`, 1 - epsilon + epsilon / AS.length);
        } else {
          updatePi(`${s},${a}`, epsilon / AS.length);
        }
      });
    });

    console.log("Q = ");
    console.log(Q);
  }, [AS, Q, SS, updatePi, epsilon]);

  /**
   * Util function
   *
   * Used to get an action at state s using the agents policy.
   * @param s The state to get can action for.
   */
  const piAction = useCallback(
    (s: number) => {
      let weights = AS.map((a) => {
        let weight = pi.get(`${s},${a}`);
        if (weight === undefined)
          throw Error(`Undefined weight from pi.get(${s},${a})`);
        return weight;
      });
      return randomChoice(weights);
    },
    [AS, pi]
  );

  /**
   * Required for Agent
   *
   * Used to initialize any values the agent needs.
   */
  const init = useCallback(() => {
    SS.forEach((s, i) => {
      /**
       * Set Q(s, a) to arbitrary values
       */
      AS.forEach((a, ii) => {
        updateQ(`${s},${a}`, 0);
        updatePi(`${s},${a}`, 0.25);
      });
    });

    S[0] = 0;
    A[0] = piAction(S[0]);
    R[0] = 0;
  }, [AS, SS, updateQ, updatePi, S, A, R, piAction]);

  useEffect(() => {
    setAgentInit(() => init);
  }, [init, setAgentInit]);

  /**
   * Required for Agent
   *
   * A callback used to reset the agent for a new episode.
   */
  const newEpisode = useCallback(() => {
    console.log("new Episode Effect ----------------------------------");
    setT(Infinity);
    set_t(0);
    setTau(0);
    let s_0 = 0;
    setS([s_0]);
    setA([piAction(s_0)]);
    setR([0]);
    // add delay to give it time to be seen on last square before resetting.
    setTimeout(() => {
      Reset();
    }, speed);
  }, [Reset, piAction, setA, setR, setS, setT, setTau, set_t, speed]);

  /**
   * Required for an Agent
   *
   * Implements one time step of the agents learning algorithm.
   * @return Returns true if learning is finished for current episode. Otherwise false.
   */
  const learn = useCallback(() => {
    let localT = T;
    let localTau = tau;
    let localS = [...S];
    let localA = [...A];
    let localR = [...R];
    if (t < localT) {
      let [obs, rew, localDone] = Step(localA[t % (n + 1)]);
      localS[(t + 1) % (n + 1)] = obs;
      localR[(t + 1) % (n + 1)] = rew;
      setS(localS);
      setR(localR);

      if (localDone) {
        localT = t + 1;
        setT(localT);
      } else {
        localA[(t + 1) % (n + 1)] = piAction(obs);
        setA(localA);
      }
    }
    localTau = t - n + 1;
    setTau(localTau); // tau is the time whose estimate is being updated
    if (localTau >= 0) {
      let G = 0;
      for (let i = localTau + 1; i <= Math.min(localTau + n, localT); i++) {
        G = G + Math.pow(discount, i - localTau - 1) * localR[i % (n + 1)];
      }
      if (localTau + n < localT) {
        let currentState = localS[(localTau + n) % (n + 1)];
        let currentAction = localA[(localTau + n) % (n + 1)];
        let stateValue = Q.get(`${currentState},${currentAction}`);
        if (stateValue === undefined) {
          throw Error(
            `state value is undefined for Q.get(${currentState},${currentAction})`
          );
        }
        G += Math.pow(discount, n) * stateValue;
      }
      let updatedStateValue = Q.get(
        `${localS[localTau % (n + 1)]},${localA[localTau % (n + 1)]}`
      );
      if (updatedStateValue === undefined) {
        throw Error(
          `undefined for Q.get ${localS[localTau % (n + 1)]},${
            A[localTau % (n + 1)]
          }`
        );
      }
      updatedStateValue += alpha * (G - updatedStateValue);
      updateQ(
        `${localS[localTau % (n + 1)]},${localA[localTau % (n + 1)]}`,
        updatedStateValue
      );
      updateGreedyPi();
    }
    if (localTau === localT - 1) {
      console.log(`Reached a terminal state returning true`);
      return true;
    }
    set_t(t + 1);
    return false;
  }, [T, tau, S, A, R, t, n, setTau, set_t, Step, setS, setR, setT, piAction, setA, Q, alpha, updateQ, updateGreedyPi, discount]); //prettier-ignore

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
    />
  );
};

export default TestAgent;
