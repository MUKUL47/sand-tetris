const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const height = 400;
const width = 400;
const D = 4;
const length = Math.floor(width / D);
//
const SAND = Array.from({ length }, () => Array.from({ length }).fill(0));
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
  filterCoordsFromSand([
    { x, y },
    {
      x: x + 1,
      y,
    },
    {
      x: x - 1,
      y,
    },
    ,
    {
      x: x + 2,
      y,
    },
    {
      x: x + 2,
      y: y + 1,
    },
    {
      x: x + 2,
      y: y + 2,
    },
    {
      x: x + 2,
      y: y + 3,
    },
    {
      x: x,
      y: y - 32,
    },
    {
      x: x + 11,
      y,
    },
  ]).forEach((c) => this.fillAreaWithSand(c.x, c.y));
});

function fillAreaWithSand(x, y) {
  ctx.fillStyle = "#FFF";
  SAND[x][y] = 1;
  renderSand();
}

function renderSand() {
  SAND.forEach((s, i) => {
    s.forEach((_, j) => {
      if (SAND[i][j] === 1) {
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
  canvas.addEventListener("mousemove", function (event) {
    // if (isMouseDown) {
    callback(event);
    // }
  });
  // // canvas.addEventListener("click", function (event) {
  // canvas.addEventListener("click", function (event) {
  //   // if (isMouseDown) {
  //   callback(event);
  //   // }
  // });
}

function loop() {
  requestAnimationFrame(loop);
  clean();
  render();
  renderSand();
  animateSand();
}
function animateSand() {
  for (let x_axis = length - 1; x_axis >= 0; x_axis--) {
    for (let y_axis = length - 1; y_axis >= 0; y_axis--) {
      const isLeft = SAND[x_axis - 1]?.[y_axis + 1] === 0;
      const isRight = SAND[x_axis + 1]?.[y_axis + 1] === 0;
      if (
        SAND[x_axis]?.[y_axis + 1] != undefined &&
        SAND[x_axis][y_axis] == 1
      ) {
        if (SAND[x_axis][y_axis + 1] == 0) {
          updateBottom(x_axis, y_axis);
        } else if (isLeft && isRight) {
          const isLeft = Math.floor(Math.random() * 2) % 2 === 0;
          console.log(isLeft);
          (isLeft && updateBottomLeft(x_axis, y_axis)) ||
            updateBottomRight(x_axis, y_axis);
        } else if (isLeft && !isRight) {
          updateBottomLeft(x_axis, y_axis);
        } else if (!isLeft && isRight) {
          updateBottomRight(x_axis, y_axis);
        }
      }
    }
  }
}

function updateBottom(x_axis, y_axis) {
  SAND[x_axis][y_axis] = 0;
  SAND[x_axis][y_axis + 1] = 1;
}

function updateBottomLeft(x_axis, y_axis) {
  SAND[x_axis][y_axis] = 0;
  SAND[x_axis - 1][y_axis + 1] = 1;
}
function updateBottomRight(x_axis, y_axis) {
  SAND[x_axis][y_axis] = 0;
  SAND[x_axis + 1][y_axis + 1] = 1;
}
loop();
