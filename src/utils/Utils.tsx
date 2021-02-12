export const sampleUniformAction = (actions: number[]) => {
  var index = Math.floor(Math.random() * actions.length);
  return actions[index];
};

// Util function
export const randomChoice = (weights: number[]): number => {
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
