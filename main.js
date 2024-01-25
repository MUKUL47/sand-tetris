const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const height = 400;
const width = 400;
const D = 2;
const length = Math.floor(width / D);
let key = null;
let keyDown = null;
let simulationSpeed = 4;
let simulationPaused = false;
let simulateRemoveParticle = [];
let spawnAvailable = true;
let completedBlocks = new Set();
let activeParticles = [];
//
const SAND = Array.from({ length }, () =>
  Array.from({ length }, () => ({ value: 0 }))
);
//

function render() {
  // for (let i = 0; i < length; i++) {
  //   for (let j = 0; j < length; j++) {
  //     ctx.fillStyle = "lightblue";
  //     ctx.strokeStyle = "blue";
  //     ctx.strokeRect(i * D, j * D, D, D);
  //   }
  // }
}
function clean() {
  ctx.clearRect(0, 0, height, width);
}

function filterCoordsFromSand(coords) {
  return coords.filter((c) => SAND[c.x]?.[c.y] != undefined);
}
setupMouseClickAndMove(canvas, (e) => {
  const x = Math.floor(e.clientX / D);
  const y = Math.floor(e.clientY / D);
});

function fillAreaWithSand(x, y) {
  ctx.fillStyle = "#FFF";
  SAND[x][y] = 1;
  renderSand();
}

function renderSand() {
  SAND.forEach((s, i) => {
    s.forEach((_, j) => {
      if (SAND[i][j].value > 0) {
        ctx.fillStyle =
          tetrisBlockColor[tetrisBlockColorIndex[SAND[i][j].value]];
        ctx.fillRect(D * i, D * j, D, D);
      }
    });
  });
}

function setupMouseClickAndMove(canvas, callback) {
  // var isMouseDown = false;
  // canvas.addEventListener("mousedown", function (event) {
  //   callback(event);
  //   isMouseDown = true;
  // });
  // canvas.addEventListener("mouseup", function (event) {
  //   callback(event);
  //   isMouseDown = false;
  // });
  // canvas.addEventListener("click", function (event) {
  canvas.addEventListener("click", function (event) {
    // if (isMouseDown) {
    // callback(event);
    // }
  });
  // // canvas.addEventListener("click", function (event) {
  // canvas.addEventListener("click", function (event) {
  //   // if (isMouseDown) {
  //   callback(event);
  //   // }
  // });
}

function simulateSand() {
  for (let x = length - 1; x >= 0; x--) {
    for (let y = length - 1; y >= 0; y--) {
      const currentParticle = SAND[x][y];
      const belowParticle = SAND[x]?.[y + 1];
      const leftBelowParticle = SAND[x - 1]?.[y + 1];
      const rightBelowParticle = SAND[x + 1]?.[y + 1];
      const isOutOfBounds = belowParticle === undefined;
      if (!isOutOfBounds && currentParticle.value > 0) {
        if (belowParticle.value === 0) {
          updateNewCoordinate(x, y, "BOTTOM");
        } else {
          const canMoveLeft = leftBelowParticle?.value === 0;
          const canMoveRight = rightBelowParticle?.value === 0;
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
  updateActiveParticle();
}

function updateActiveParticle() {
  for (const particle of activeParticles) {
    if (particle.y === length - 1) {
      particle.isDone = true;
      completedBlocks.add(particle.id);
      spawn();
      return;
    }

    for (const n of getStaticNeigbours(particle)) {
      const neighbour = SAND[n.x]?.[n.y];
      if (neighbour?.id != particle.id && completedBlocks.has(neighbour?.id)) {
        particle.isDone = true;
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

const coordinateMapX = {
  LEFT: -1,
  RIGHT: 1,
  BOTTOM: 0,
};
function updateNewCoordinate(x, y, coordinate) {
  const newCoordinateX = x + coordinateMapX[coordinate];
  const newCoordinateY = y + 1;
  const currentParticle = SAND[x][y];
  SAND[newCoordinateX][newCoordinateY] = currentParticle;
  SAND[newCoordinateX][newCoordinateY].x = newCoordinateX;
  SAND[newCoordinateX][newCoordinateY].y = newCoordinateY;
  SAND[x][y] = { value: 0 };
}
function loop() {
  requestAnimationFrame(() => {
    if (key === "UP") {
      rotateBlockParticles();
    }
    if (keyDown === "RIGHT" || keyDown === "LEFT") {
      moveBlockParticles(keyDown);
    }
    if (keyDown === "DOWN") {
      simulationSpeed = 3;
    }
    clean();
    render();
    renderSand();
    for (let i = 0; i < simulationSpeed && !simulationPaused; i++) {
      simulateSand();
    }
    const removeParticleUntil = simulateRemoveParticle.length > 0 ? 20 : 1;
    for (let i = 0; i < removeParticleUntil; i++) {
      removeSameColorFill();
    }
    key = null;
    keyDown = null;
    simulationSpeed = 1;
    loop();
  });
}
loop();
setup();

function spawn() {
  const start = Math.floor(length / 4);
  const randX = Math.floor(Math.random() * (length - start - start + 1)) + 50;
  const cb = Object.keys(TETRS_BLOCK);
  const b = cb[Math.floor(Math.random() * cb.length)];
  const blocks = generateBlockCoordinates(b, {
    coordinate: { x: randX, y: 20 },
    depth: 5,
  });
  let id = Date.now();
  activeParticles = [];
  blocks.forEach((c) => {
    if (!(c.x >= length || c.y >= length)) {
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
  });
}
function rotateBlockParticles() {
  [activeParticles, coordsMap] = rotateBlock(activeParticles);
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
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
    (direction === "RIGHT" && max + dirCoord >= length) ||
    (direction === "LEFT" && min + dirCoord < 0)
  )
    return;
  const particlesMap = activeParticles.reduce((a, c) => {
    c.x += dirCoord;
    a.set(`${c.x},${c.y}`, c);
    return a;
  }, new Map());
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
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
    }
    return;
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
        initialParticle[index].x === 0 ? x === length - 1 : x === 0;
    }
    getStaticNeigbours({ x, y })
      .filter((p) => {
        const v = SAND[p.x]?.[p.y];
        if (v?.color !== initialParticle[index].color) return false;
        return !(
          !v ||
          v?.x < 0 ||
          v?.x >= length ||
          v?.y < 0 ||
          v?.y >= length ||
          v?.value === 0 ||
          visitedParticles[index].has(`${v.x},${v.y}`)
        );
      })
      .forEach((v) => floodFill(v, index));
  };
  const uniqueParticlesAtBorder = SAND[0].reduce((a, c) => {
    if (c.id && completedBlocks.has(c.id) && !a.has(c.color)) {
      a.set(c.color, c);
    }
    return a;
  }, new Map());
  if (uniqueParticlesAtBorder.size > 0) {
    let i = 0;
    for (let [_, v] of uniqueParticlesAtBorder) {
      initialParticle.push(v);
      visitedParticles.push(new Set());
      fillSucceeded[i] = false;
      floodFill(v, i++);
    }
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
function setup() {
  spawn();
  onKey();
}
