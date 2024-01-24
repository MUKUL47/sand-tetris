const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const height = 400;
const width = 400;
const D = 100;
const length = Math.floor(width / D);
//
let SAND = Array.from({ length }, () =>
  Array.from({ length }, () => ({ isDone: false, sand: [] }))
);
//

function render() {
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      ctx.fillStyle = "lightblue";
      ctx.strokeStyle = "blue";
      ctx.strokeRect(i * D, j * D, D, D);
    }
  }
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
  filterCoordsFromSand([{ x, y }]).forEach((c) =>
    this.fillAreaWithSand(c.x, c.y)
  );
});
function fillAreaWithSand(x, y) {
  ctx.fillStyle = "#FFF";
  SAND[x][y].sand = [1];
}

function renderSand() {
  SAND.forEach((s, i) => {
    s.forEach((_, j) => {
      if (SAND[i][j].sand.length > 0) {
        ctx.fillRect(D * i, D * j, D, D);
      }
    });
  });
}

function setupMouseClickAndMove(canvas, callback) {
  canvas.addEventListener("click", function (event) {
    callback(event);
  });
}

function loop() {
  requestAnimationFrame(loop);
  clean();
  render();
  animateSand();
  renderSand();
}

function animateSand() {
  resetSandIteration();
  for (let x_axis = 0; x_axis < length; x_axis++) {
    for (let y_axis = 0; y_axis < length; y_axis++) {
      if (
        !SAND[x_axis][y_axis].isDone &&
        SAND[x_axis][y_axis].sand.length > 0
      ) {
        const isRight = SAND[x_axis + 1]?.[y_axis + 1]?.sand.length === 0;
        const isLeft = SAND[x_axis - 1]?.[y_axis + 1]?.sand.length === 0;
        const isBottom = SAND[x_axis]?.[y_axis + 1]?.sand.length === 0;
        if (isBottom) {
          updateBottom(x_axis, y_axis);
        } else {
          if (isLeft && isRight) {
            if (Math.floor(Math.random() * 2) % 2 === 0) {
              updateBottomLeft(x_axis, y_axis);
              continue;
            }
            updateBottomRight(x_axis, y_axis);
          } else if (isRight) {
            updateBottomRight(x_axis, y_axis);
          } else if (isLeft) {
            updateBottomLeft(x_axis, y_axis);
          }
        }
      }
    }
  }
}

function updateBottom(x_axis, y_axis) {
  SAND[x_axis][y_axis + 1].sand = [1];
  SAND[x_axis][y_axis].sand = [];
  SAND[x_axis][y_axis + 1].isDone = true;
}
function updateBottomRight(x_axis, y_axis) {
  SAND[x_axis][y_axis].sand = [];
  SAND[x_axis + 1][y_axis + 1].sand = [1];
  SAND[x_axis + 1][y_axis + 1].isDone = true;
}

function updateBottomLeft(x_axis, y_axis) {
  SAND[x_axis][y_axis].sand = [];
  SAND[x_axis - 1][y_axis + 1].sand = [1];
  SAND[x_axis - 1][y_axis + 1].isDone = true;
}

function resetSandIteration() {
  for (let x_axis = 0; x_axis < length; x_axis++) {
    for (let y_axis = 0; y_axis < length; y_axis++) {
      SAND[x_axis][y_axis].isDone = false;
    }
  }
}
loop();
