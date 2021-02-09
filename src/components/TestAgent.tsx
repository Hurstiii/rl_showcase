import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

interface Props {
  step: (action: number) => [number, number, boolean, Object];
  action_space: number[];
  observation_space: number[];
  done: boolean;
  reset: Function;
}

const TestAgent: React.FC<Props> = (props) => {
  const AS = props.action_space;
  const SS = props.observation_space;
  const epsilon = 0.1;
  const alpha = 0.2;
  const n = 2;
  const discount = 0.9;

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

  const [t, set_t] = useState(0);

  const [tau, setTau] = useState(0);
  const [T, setT] = useState(Infinity);

  const [S, setS] = useState<number[]>([]); // state memory
  const [A, setA] = useState<number[]>([]); // action memory
  const [R, setR] = useState<number[]>([]); // reward memory

  const [simulating, setSimulating] = useState(false);
  const interval = useRef<NodeJS.Timeout | null>(null);

  const done = props.done;
  const Step = props.step;
  const Reset = props.reset;

  const [learning, setLearning] = useState(false);

  const [episodes, setEpisodes] = useState(1);
  const [speed, setSpeed] = useState(100);

  const updateGreedyPi = useCallback(() => {
    // console.log(Q);
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
          // if (s === 0) {
          //   console.log(
          //     `cV ${currentValue} = bV ${bestValue} for Q(${s},${a})`
          //   );
          // }
          bestActions.push(a);
          bestValue = currentValue;
        } else if (currentValue > bestValue) {
          // if (s === 0) {
          //   console.log(
          //     `cV ${currentValue} > bV ${bestValue} for Q(${s},${a})`
          //   );
          // }
          bestActions = [a];
          bestValue = currentValue;
        }
      });

      /**
       * Break ties randomly i.e. choose a random action from bestActions
       */
      var bestAction: number = sampleUniformAction(bestActions);
      // if (s === 0) {
      //   console.log(`BREAKING TIES RANDOMLY`);
      //   console.log(bestActions);
      //   console.log(bestAction);
      // }
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

    // console.log("Pi = ");
    // console.log(pi);

    console.log("Q = ");
    console.log(Q);
  }, [AS, Q, SS, updatePi]);

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

    // console.log(`init: Q | `);
    // console.log(Q);

    // console.log(`init: pi | `);
    // console.log(pi);
  }, [AS, SS, updateQ, updatePi]);

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

  const newEpisode = useCallback(() => {
    console.log("new Episode Effect ----------------------------------");
    setEpisodes(episodes + 1);
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
  }, [Reset, episodes, piAction, speed]);

  /**
   * onComponentDidMount
   */
  useEffect(() => {
    console.log("init Effect ----------------------------------");
    init();

    S[0] = 0;
    A[0] = piAction(S[0]);
    R[0] = 0;
  }, []);

  useEffect(() => {
    if (done && simulating && !learning) {
    }
  }, [done, simulating, learning]);

  const learn = useCallback(() => {
    setLearning(true);
    let localT = T;
    let localTau = tau;
    let localS = [...S];
    let localA = [...A];
    let localR = [...R];
    // console.log(" ---- Handle Step ----");
    // console.log(localS);
    // console.log(localA);
    // console.log(localR);
    // console.log(`t=${t}`);
    // console.log(`tau=${localTau}`);
    // console.log(`T=${localT}`);
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

      // console.log(` --- Memory after step ---`);
      // console.log(localS);
      // console.log(localA);
      // console.log(localR);
      // console.log(` ------------------------`);
    }
    localTau = t - n + 1;
    setTau(localTau); // tau is the time whose estimate is being updated
    if (localTau >= 0) {
      // console.log(`updating tau at ${localTau}`);
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
      // console.log(updatedStateValue);
      updateQ(
        `${localS[localTau % (n + 1)]},${localA[localTau % (n + 1)]}`,
        updatedStateValue
      );
      updateGreedyPi();
    }
    if (localTau === localT - 1) {
      // console.log(
      //   `localTau: ${localTau} is equal tp localT - 1: ${localT - 1}`
      // );
      if (simulating) {
        newEpisode();
      }
      setLearning(false);
      return;
    }
    set_t(t + 1);
    setLearning(false);
  }, [
    A,
    Q,
    R,
    S,
    T,
    piAction,
    t,
    tau,
    updateGreedyPi,
    updateQ,
    Step,
    newEpisode,
    simulating,
  ]);

  useEffect(() => {
    if (simulating) {
      interval.current = setInterval(() => {
        learn();
      }, speed);

      return () => {
        if (interval.current !== null) {
          clearInterval(interval.current);
        }
      };
    }
  }, [simulating, learn, speed]);

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

  const handleStep = (e: MouseEvent) => {
    if (!done) {
      learn();
    }
  };

  const handleSimulate = (e: React.MouseEvent) => {
    let newSimulating = !simulating;
    setSimulating(newSimulating);
  };

  const sampleUniformAction = (actions: number[]) => {
    var index = Math.floor(Math.random() * actions.length);
    return actions[index];
  };

  return (
    <div>
      <button onClick={handleStep}>Step</button>
      <button onClick={handleSimulate}>Simulate</button>
      <h2>ep={episodes}</h2>
      <h2>t={t}</h2>
    </div>
  );
};

export default TestAgent;
