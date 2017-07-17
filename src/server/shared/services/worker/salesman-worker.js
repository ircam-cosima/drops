/**
 * as this is a worker `require` or `import` are not supported
 * then make sure to use only es5 compliant functionnalities
 */

const pow = Math.pow;
const floor = Math.floor;
const random = Math.random;
const min = Math.min;
const max = Math.max;
const sqrt = Math.sqrt;
const cos = Math.cos;

// ------------------------------------------------------
// helpers
// ------------------------------------------------------

// Fisher-Yates algorithm
function randomize(arr) {
  const length = arr.length;

  for (let i = length - 1; i > 0; i--) {
    const target = floor(random() * length);
    const s = arr[i];
    arr[i] = arr[target];
    arr[target] = s;
  }
}

function copy(a, b) {
  for (let i = 0, len = a.length; i < len; i++)
    b[i] = a[i];
}

function indexOf(arr, value) {
  const len = arr.length;

  for (let i = 0; i < len; i++)
    if (arr[i] === value) return i;

  return -1;
}

// prevent Object.key use
function getObjectLength(obj) {
  let counter = 0;
  for (let key in obj)
    counter++;

  return counter;
}

function getObjectKeys(obj) {
  let keys = [];
  for (let key in obj)
    keys.push(key);

  return keys;
}

const toRadians = Math.PI / 180;

function convertToRadians(poi) {
  poi.coordinates[0] *= toRadians;
  poi.coordinates[1] *= toRadians;

  return poi;
}


// ------------------------------------------------------
// GA
// ------------------------------------------------------

// let positions = null;
const pois = {};
// stack of two populations to swap between each generations
let stack = null;
let currentGeneration = [];

let populationSize = null;
let generationCounter = 0;
// arrays to store computations
let fitnesses = null;
let pathLengths = null;

let crossoverProbability = null;
let mutationProbability = null;

// ------------------------------------------------------
// Public API
// ------------------------------------------------------

function initialize(_pois = [], _populationSize = 100, _crossoverProbability = 0.8, _mutationProbability = 0.8) {

  // populate pois with given points
  for (let i = 0; i < _pois.length; i++) {
    const poi = _pois[i];
    const id = poi.id;
    convertToRadians
    pois[id] = convertToRadians(poi);
  }
  // create two stack of population to be swaped on each generation
  crossoverProbability = _crossoverProbability;
  mutationProbability = _mutationProbability;

  // init arrays to store computations
  populationSize = _populationSize;
  fitnesses = new Array(populationSize);
  pathLengths = new Array(populationSize);
  generationCounter = 0;

  // initialize arrays of positions indexes
  const poisLength = getObjectLength(pois);
  stack = [new Array(populationSize), new Array(populationSize)];

  for (let i = 0; i < populationSize; i++) {
    stack[0][i] = new Array(poisLength);
    stack[1][i] = new Array(poisLength);
  }

  // populate first stack with random values
  const population = stack[0];
  const poiIds = getObjectKeys(pois);

  for (let i = 0; i < populationSize; i++) {
    const path = population[i];
    copy(poiIds, path);
    randomize(path);
  }
}

function evolve(nbrGenerations = 100) {
  let bestPath = [];

  if (getObjectLength(pois) < 1)
    return bestPath;

  for (let i = 0; i < nbrGenerations; i++) {
    const ancestors = stack[generationCounter];
    generationCounter = (generationCounter + 1) % 2;
    const offsprings = stack[generationCounter];

    // get the best path from the ancestors
    // fitness is the more resource consuming part of the algorithm and
    // is of size populationSize * pathLen
    bestPath = _fitness(ancestors);

    // apply elitism to the new population
    const elitLength = _elitism(bestPath, offsprings);

    for (let j = elitLength; j < populationSize; j++) {
      const offspring = offsprings[j];

      if (random() < crossoverProbability) {
        // select parents
        const genitors = _getGenitors(ancestors);
        _crossover(genitors, offspring);
      } else {
        copy(ancestors[j], offspring);
      }

      if (random() < mutationProbability)
        _mutate(offspring);
    }
  }

  return bestPath;
}

function add(poi) {
  const poiId = poi.id;
  pois[poiId] = convertToRadians(poi);

  // insert new position index randomly in each current population individuals
  const currentPopulation = stack[generationCounter];

  // put new poi at random position in existing population
  for (let i = 0; i < populationSize; i++) {
    const path = currentPopulation[i];
    path.push(poiId);

    const index = path.length - 1;
    // random permutation with another index
    const otherIndex = floor(random() * path.length);
    const store = path[otherIndex];
    path[otherIndex] = poiId;
    path[index] = store;
  }

  // insert new position index at the end of next population individuals
  const cache = stack[(generationCounter + 1) % 2];

  for (let i = 0; i < populationSize; i++)
    cache[i].push(poiId);

  // increase fitness and pathLengths size
  fitnesses.length = fitnesses.length + 1;
  pathLengths.length = pathLengths.length + 1;
}

function update(poi) {
  pois[poi.id] = convertToRadians(poi);

  // console.log('update', Object.keys(pois).length);
}

function remove(poi) {
  const poiId = poi.id;
  delete pois[poiId];

  // remove position index from each populations
  const current = stack[0];
  const cache = stack[1];

  // remove from paths in whole population
  for (let i = 0; i < populationSize; i++) {
    const index0 = indexOf(current[i], poiId);
    const index1 = indexOf(cache[i], poiId);

    current[i].splice(index0, 1);
    cache[i].splice(index1, 1);
  }

  // decrease fitness and pathLengths size
  fitnesses.length = fitnesses.length - 1;
  pathLengths.length = pathLengths.length - 1;
}

// ------------------------------------------------------
// Private API
// ------------------------------------------------------

function _fitness(population) {
  const len = population.length;
  let totalFitness = 0;
  let totalLength = 0;
  let bestLength = +Infinity;
  let bestPath = null;

  // path of each path
  for (let i = 0; i < len; i++) {
    const path = population[i];
    const length = _getPathLength(path);

    if (length < bestLength) {
      bestLength = length;
      bestPath = path;
    }

    pathLengths[i] = length;
    totalLength += length;
  }

  // define fitness - the lower the distance, the higher the fitness
  for (let i = 0; i < len; i++) {
    // normalize path (defense against totalLength === 0)
    const normPathLength = totalLength === 0 ? 0 : pathLengths[i] / totalLength;
    const fitness = pow(1 - normPathLength, 2);

    // total fitness is the last element
    fitnesses[i] = (i === 0) ? fitness : fitnesses[i - 1] + fitness;
  }

  return bestPath;
}

const toDegree = 180 / Math.PI;

// equirectanguler distance approximation
// http://stackoverflow.com/questions/15736995/how-can-i-quickly-estimate-the-distance-between-two-latitude-longitude-points
function _getPathLength(path) {
  const length = path.length;
  const radius = 6371; // radius of the earth in km
  let pathLength = 0;

  for (let i = 0; i < length; i++) {
    const a = pois[path[i]].coordinates;
    const b = pois[path[(i + 1) % length]].coordinates;
    const lat1 = a[0];
    const lng1 = a[1];
    const lat2 = b[0];
    const lng2 = b[1];

    const x = (lng2 - lng1) * cos(0.5 * (lat2 + lat1));
    const y = lat2 - lat1;
    const distance = radius * sqrt(x * x + y * y);

    pathLength += distance;
  }

  return pathLength;
}

function _elitism(best, offsprings) {
  const length = best.length;
  let numElit = 0;

  if (populationSize > 1) {
    // best copy
    copy(best, offsprings[0]);
    numElit += 1;
  }

  if (populationSize > 2) {
    // best in reverse order
    const offspring = offsprings[1];

    for (let i = 0; i < length; i++)
      offspring[length - (i + 1)] = best[i];

    numElit += 1;
  }

  if (populationSize > 10) {
    // best mutated
    for (let i = numElit; i < numElit + 3; i++) {
      const offspring = offsprings[i];
      copy(best, offspring);
      _mutate(offspring);
    }

    numElit += 3;
  }

  return numElit;
}

function _getGenitors(population) {
  const totalFitness = fitnesses[populationSize - 1];
  const genitors = new Array(2);

  for (let i = 0; i < 2; i++) {
    const probability = Math.random() * totalFitness;

    for (let j = 0; j < populationSize; j++) {
      if (fitnesses[j] > probability)
        genitors[i] = population[j];
    }
  }

  return genitors;
}

function _crossover(genitors, offspring) {
  const parentA  = genitors[1];
  const parentB = genitors[1];
  const len = offspring.length;
  const start = floor(random() * len);
  const stop = floor(random() * len);

  // destroy previous information
  for (let i = 0; i < len; i++)
    offspring[i] = -1;

  // copy extract from parent A
  for (let i = start; i < stop; i++)
    offspring[i] = parentA[i];

  // fill gaps with parent B
  let pointer = 0;
  // fill before start
  for (let i = 0; i < start; i++) {
    while (offspring[i] === -1) {
      const value = parentB[pointer];

      if (indexOf(offspring, value) === -1)
        offspring[i] = value;

      pointer++;
    }
  }

  // fill after end
  for (let i = stop; i < len; i++) {
    while (offspring[i] === -1) {
      const value = parentB[pointer];

      if (indexOf(offspring, value) === -1)
        offspring[i] = value;

      pointer++;
    }
  }
}

function _mutate(path) {
  const length = path.length;

  // cannot mutate something that as 0 or 1 elements
  if (length < 2)
    return path;

  const a = floor(random() * length);
  const b = floor(random() * length);
  const start = min(a, b);
  const end = max(a, b);
  const p = random();

  if (p < 0.3333333) {
    // inversion mutation
    // Before   15 937462 80
    // After    15 264739 80
    for (let i = start, j = end; i <= end, j >= end; i++, j--) {
      const s = path[i];
      path[i] = path[j];
      path[j] = s;
    }
  } else if (p < 0.6666666) {
    // displacement mutation
    // Before  15 9 37462 80
    // After   15 37462 9 80
    const s = path[start];

    for (let i = start; i < end; i++)
      path[i] = path[i + 1];

    path[end] = s;
  } else {
    // pairwise mutation
    // Before 15 9 3746 2 80
    // After  15 2 3746 9 80
    const s = path[start];
    path[start] = path[end];
    path[end] = s;
  }
}


self.onmessage = (e) => {
  const data = e.data;
  const cmd = data.cmd;

  switch (cmd) {
    case 'initialize':
      const { populationSize } = data;
      initialize([], populationSize);
      break;
    case 'evolve':
      const best = evolve(data.generations);
      self.postMessage({ cmd: 'result', path: best });
      break;
    case 'add':
      add(data.poi);
      break;
    case 'remove':
      remove(data.poi);
      break;
    case 'update':
      update(data.poi);
      break;
  }
}


