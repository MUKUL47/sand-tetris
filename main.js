const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const height = 500;
const width = 300;
const BLOCK_SIZE = 2;
const depth = 5;
const length_height = Math.floor(height / BLOCK_SIZE);
const length_width = Math.floor(width / BLOCK_SIZE);
let key = null;
let keyDown = null;
let simulationSpeed = 30;
let simulationPaused = false;
let simulateRemoveParticle = [];
let spawnAvailable = true;
let completedBlocks = new Set();
let activeBlocks = new Set();
let activeParticles = [];
let gameOver = false;
const coordinateMapX = {
  LEFT: -1,
  RIGHT: 1,
  BOTTOM: 0,
};
const SAND = Array.from({ length: length_width }, () =>
  Array.from({ length: length_height }, () => ({ value: 0 }))
);
//
function setup() {
  spawn();
  onKey();
}
function clean() {
  ctx.clearRect(0, 0, height, height);
}

function filterCoordsFromSand(coords) {
  return coords.filter((c) => SAND[c.x]?.[c.y] != undefined);
}

function renderSand() {
  for (let i = length_width - 1; i >= 0; i--) {
    for (let j = length_height - 1; j >= 0; j--) {
      if (SAND[i][j].value > 0) {
        ctx.fillStyle =
          tetrisBlockColor[tetrisBlockColorIndex[SAND[i][j].value]];
        ctx.fillRect(BLOCK_SIZE * i, BLOCK_SIZE * j, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}
function simulateSandParticle() {
  let allParticlesSettled = true;
  for (let x = length_width - 1; x >= 0; x--) {
    for (let y = length_height - 1; y >= 0; y--) {
      const currentParticle = SAND[x][y];
      const belowParticle = SAND[x]?.[y + 1];
      const leftBelowParticle = SAND[x - 1]?.[y + 1];
      const rightBelowParticle = SAND[x + 1]?.[y + 1];
      const isOutOfBounds = belowParticle === undefined;
      if (!isOutOfBounds && currentParticle.value > 0) {
        if (belowParticle.value === 0) {
          updateNewCoordinate(x, y, "BOTTOM");
          allParticlesSettled = false;
        } else {
          const canMoveLeft = leftBelowParticle?.value === 0;
          const canMoveRight = rightBelowParticle?.value === 0;
          allParticlesSettled = !(canMoveLeft || canMoveRight);
          if (canMoveLeft && canMoveRight) {
            Math.floor(Math.random() * 2) % 2 === 0
              ? updateNewCoordinate(x, y, "LEFT")
              : updateNewCoordinate(x, y, "RIGHT");
          } else if (canMoveLeft) {
            updateNewCoordinate(x, y, "LEFT");
          } else if (canMoveRight) {
            updateNewCoordinate(x, y, "RIGHT");
          }
        }
      }
    }
  }
  // updateActiveParticle();
  // spawnAvailable = allParticlesSettled;
  updateActiveParticle();
}

function updateActiveParticle() {
  for (const particle of activeParticles) {
    if (particle.y === length_height - 1) {
      particle.isDone = true;
      activeBlocks.delete(particle.id);
      completedBlocks.add(particle.id);
      spawn();
      return;
    }

    for (const n of getStaticNeigbours({
      ...particle,
      includeDiagonals: true,
    })) {
      const neighbour = SAND[n.x]?.[n.y];
      if (neighbour?.id != particle.id && completedBlocks.has(neighbour?.id)) {
        particle.isDone = true;
        activeBlocks.delete(particle.id);
        completedBlocks.add(particle.id);
        spawn();
        return;
      }
    }

    if (completedBlocks.has(particle.id)) {
      return;
    }
  }
}
function updateNewCoordinate(x, y, coordinate) {
  const newCoordinateX = x + coordinateMapX[coordinate];
  const newCoordinateY = y + 1;
  const currentParticle = SAND[x][y];
  SAND[newCoordinateX][newCoordinateY] = currentParticle;
  SAND[newCoordinateX][newCoordinateY].x = newCoordinateX;
  SAND[newCoordinateX][newCoordinateY].y = newCoordinateY;
  SAND[x][y] = { value: 0 };
}
loop();
setup();

function spawn() {
  const randX = Math.floor(length_width / 2);
  const cb = Object.keys(TETRS_BLOCK);
  const b = cb[Math.floor(Math.random() * cb.length)];
  const blocks = generateBlockCoordinates(b, {
    coordinate: { x: randX, y: 15 },
    depth,
  });
  checkGameOver(blocks);
  let id = Date.now();
  activeParticles = [];
  blocks.forEach((c) => {
    if (!(c.x >= length_width || c.y >= length_height)) {
      SAND[c.x][c.y] = {
        value: tetrisBlockIndex[b],
        id,
        block: b,
        x: c.x,
        y: c.y,
        color: tetrisBlockColor[b],
      };
      activeParticles.push(SAND[c.x][c.y]);
    }
    activeBlocks.add(id);
  });
}
function rotateBlockParticles() {
  [activeParticles, coordsMap] = rotateBlock(activeParticles);
  for (let i = 0; i < length_width; i++) {
    for (let j = 0; j < length_height; j++) {
      if (SAND[i][j].id && !completedBlocks.has(SAND[i][j].id)) {
        SAND[i][j] = { value: 0 };
      }
      const hash = `${i},${j}`;
      if (coordsMap.has(hash)) {
        //BUG : while rotating active particles are coinciding with settled particles dont rotate if coinciding is possible
        SAND[i][j] = coordsMap.get(hash);
      }
    }
  }
}
function moveBlockParticles(direction) {
  const dirCoord = direction === "RIGHT" ? 5 : -5;
  const [max, min] = activeParticles.reduce(
    ([_min, _max], c) => {
      const max = _min > c.x ? _min : c.x;
      const min = _max < c.x ? _max : c.x;
      return [max, min];
    },
    [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
  );
  if (
    (direction === "RIGHT" && max + dirCoord >= length_width) ||
    (direction === "LEFT" && min + dirCoord < 0)
  ) {
    return;
  }
  const particlesMap = activeParticles.reduce((a, c) => {
    c.x += dirCoord;
    a.set(`${c.x},${c.y}`, c);
    return a;
  }, new Map());
  for (let i = 0; i < length_width; i++) {
    for (let j = 0; j < length_height; j++) {
      if (SAND[i][j].id && !completedBlocks.has(SAND[i][j].id)) {
        SAND[i][j] = { value: 0 };
      }
      const hash = `${i},${j}`;
      if (particlesMap.has(hash)) {
        SAND[i][j] = particlesMap.get(hash);
      }
    }
  }
}
function removeSameColorFill() {
  if (simulationPaused) {
    if (simulateRemoveParticle.length > 0) {
      const sand = simulateRemoveParticle.pop();
      sand.value = 0;
      return;
    } else {
      simulationPaused = false;
      return;
    }
  }

  const visitedParticles = [];
  const initialParticle = [];
  const fillSucceeded = [];
  const floodFill = (particle, index) => {
    const { x, y } = particle;
    const hash = `${x},${y}`;
    visitedParticles[index].add(hash);
    if (
      !fillSucceeded[index] &&
      !(initialParticle[index].x === x && initialParticle[index].y === y)
    ) {
      fillSucceeded[index] =
        initialParticle[index].x === 0 ? x === length_width - 1 : x === 0;
    }
    getStaticNeigbours({ x, y, includeDiagonals: true })
      .filter((p) => {
        const v = SAND[p.x]?.[p.y];
        if (v?.color !== initialParticle[index].color) return false;
        return !(
          !v ||
          v?.x < 0 ||
          v?.x >= length_width ||
          v?.y < 0 ||
          v?.y >= length_height ||
          v?.value === 0 ||
          visitedParticles[index].has(`${v.x},${v.y}`)
        );
      })
      .forEach((v) => floodFill(v, index));
  };

  const uniqueParticlesAtBorder = new Map();
  SAND[SAND.length - 1].forEach((c) => {
    if (
      c.value > 0 &&
      completedBlocks.has(c.id) &&
      !uniqueParticlesAtBorder.has(c.color)
    ) {
      uniqueParticlesAtBorder.set(c.color, c);
    }
  });

  if (uniqueParticlesAtBorder.size > 0) {
    uniqueParticlesAtBorder.forEach((v) => {
      initialParticle.push(v);
      visitedParticles.push(new Set());
      fillSucceeded.push(false);
      floodFill(v, fillSucceeded.length - 1);
    });
  }

  for (let i = 0; i < fillSucceeded.length; i++) {
    if (fillSucceeded[i]) {
      simulationPaused = true;
      for (let p of visitedParticles[i]) {
        const [x, y] = p.split(",").map(Number);
        simulateRemoveParticle.push(SAND[x][y]);
      }
    }
  }
}

function checkGameOver(upcomingBlockCoordinates) {
  const coordsMap = upcomingBlockCoordinates.reduce((a, c) => {
    a.set(`${c.x},${c.y}`, true);
    return a;
  }, new Map());
  for (let i = 0; i < length_width; i++) {
    for (let j = 0; j < length_height; j++) {
      if (SAND[i][j].value > 0 && coordsMap.has(`${i},${j}`)) {
        gameOver = true;
        break;
      }
    }
  }
}

function onKey() {
  ["keydown", "keyup"].map((e) =>
    document.addEventListener(e, function (event) {
      if (event.key.startsWith("Arrow")) {
        const r = event.key.replace("Arrow", "").toUpperCase();
        if (e === "keyup") {
          key = r;
          return;
        }
        keyDown = r;
      }
    })
  );
}
function handleControls() {
  if (key === "UP") {
    rotateBlockParticles();
  }
  if (keyDown === "RIGHT" || keyDown === "LEFT") {
    moveBlockParticles(keyDown);
  }
  if (keyDown === "DOWN") {
    simulationSpeed = 3;
  }
}
function loop() {
  requestAnimationFrame(() => {
    if (!gameOver) {
      handleControls();
      for (let i = 0; i < simulationSpeed && !simulationPaused; i++) {
        simulateSandParticle();
      }
      const removeParticleUntil = simulateRemoveParticle.length > 0 ? 20 : 1;
      for (let i = 0; i < removeParticleUntil; i++) {
        removeSameColorFill();
      }
      key = null;
      keyDown = null;
      simulationSpeed = 1;
    }
    clean();
    renderSand();
    loop();
  });
}
