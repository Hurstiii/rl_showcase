import React, { useCallback, useState } from "react";
import Agent from "./Agent";

interface Props {
  step: (action: number) => [number, number, boolean, Object];
  action_space: number[];
  state_space: number[];
  reset: Function;
  speed: number;
}

const TestAgent: React.FC<Props> = (props) => {
  const AS = props.action_space;
  const SS = props.state_space;
  const Step = props.step; // Step callback of the environment.
  const Reset = props.reset; // Reset callback of the environment.
  const speed = props.speed; // Delay between agent actions.

  /**
   * TODO: make prop values so they can be set at the top level and changed.
   *
   * Constants used for the learning.
   */
  const epsilon = 0.1; // chance used for epsilon-greedy policy.
  const alpha = 0.2; // learning rate.
  const n = 5; // number of steps updated.
  const discount = 0.9; // discount applied on future returns.

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
  }, [AS, Q, SS, updatePi]);

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
  }, [Reset, piAction, speed]);

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
  }, [A, Q, R, S, T, piAction, t, tau, updateGreedyPi, updateQ, Step]);

  // Util function
  const randomChoice = (weights: number[]): number => {
    var total = 0;
    var cumalitive = weights.map((v) => {
      total += v;
      return total;
    });

    var r = Math.random() * total;
    for (var i = 0; i < cumalitive.length; i++) {
      if (r < cumalitive[i]) {
        return i;
      }
    }

    throw Error(`Choice not made`);
  };

  // Util function
  const sampleUniformAction = (actions: number[]) => {
    var index = Math.floor(Math.random() * actions.length);
    return actions[index];
  };

  return (
    <Agent
      newEpisode={newEpisode}
      init={init}
      learn={learn}
      speed={speed}
      timeStep={t}
    />
  );
};

export default TestAgent;
