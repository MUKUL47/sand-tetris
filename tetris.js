function getNeighbours({ x, y }, depth = 1) {
  const neighbours = [];
  const neighboursSet = new Set();
  const boundsLoop = (nextCoordinate) => {
    const hash = `${nextCoordinate.x},${nextCoordinate.y}`;
    if (
      Math.abs(nextCoordinate.x - x) > depth ||
      Math.abs(nextCoordinate.y - y) > depth ||
      neighboursSet.has(hash)
    )
      return;
    neighbours.push(nextCoordinate);
    neighboursSet.add(hash);
    return getStaticNeigbours({
      x: nextCoordinate.x,
      y: nextCoordinate.y,
    }).forEach(boundsLoop);
  };
  boundsLoop({ x, y });
  return neighbours;
}
function getStaticNeigbours({ x, y, includeDiagonals = false }) {
  const neighbors = [
    { x: x + 1, y: y },
    { x: x - 1, y: y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
  ];

  if (includeDiagonals) {
    neighbors.push(
      { x: x + 1, y: y + 1 },
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 }
    );
  }

  return neighbors;
}

const BLOCK_COORDINATES = {
  J: ({ x, y }, depth) => [
    { x, y },
    { x: x, y: y + depth * 1 * 2 - 1 },
    { x: x + depth * 1 * 2 - 1, y: y + depth * 1 * 2 - 1 },
    { x: x + depth * 2 * 2 - 2, y: y + depth * 1 * 2 - 1 },
  ],

  I: ({ x, y }, depth) => [
    { x, y },
    { x: x + depth * 1 * 2 - 1, y },
    { x: x + depth * 2 * 2 - 2, y },
    { x: x + depth * 3 * 2 - 3, y },
  ],

  O: ({ x, y }, depth) => [
    { x, y },
    { x, y: y + depth * 1 * 2 - 1 },
    { x: x + depth * 1 * 2 - 1, y },
    { x: x + depth * 1 * 2 - 1, y: y + depth * 1 * 2 - 1 },
  ],

  S: ({ x, y }, depth) => [
    { x, y },
    { x: x + depth * 1 * 2 - 1, y },
    { x: x + depth * 1 * 2 - 1, y: y + depth * 1 * 2 - 1 },
    { x: x + depth * 2 * 2 - 2, y: y + depth * 1 * 2 - 1 },
  ],

  Z: ({ x, y }, depth) => [
    { x, y },
    { x: x + depth * 1 * 2 - 1, y },
    { x: x + depth * 1 * 2 - 1, y: y - depth * 1 * 2 + 1 },
    { x: x + depth * 2 * 2 - 2, y: y - depth * 1 * 2 + 1 },
  ],

  T: ({ x, y }, depth) => [
    { x, y },
    { x: x - depth * 1 * 2 + 1, y: y + depth * 1 * 2 - 1 },
    { x: x, y: y + depth * 1 * 2 - 1 },
    { x: x + depth * 1 * 2 - 1, y: y + depth * 1 * 2 - 1 },
  ],
};

const generateBlockCoordinates = (blockType, options) => {
  if (BLOCK_COORDINATES[blockType])
    return BLOCK_COORDINATES[blockType](options.coordinate, options.depth)
      .map((c) => getNeighbours(c, options.depth - 1))
      .flat();
};
//https://github.com/MUKUL47/Tetris/blob/66cccc6ab951fa85457a4d2851c7df3824037c08/block.js#L56
function rotateBlock(coordinates, center) {
  const coordsMap = new Map();
  if (!center) {
    center = coordinates[Math.round(coordinates.length / 2)];
  }
  for (let i = 0; i < coordinates.length; i++) {
    let x1 = coordinates[i].x - center.x;
    let y1 = coordinates[i].y - center.y;
    let x11 = -y1;
    let y11 = x1;
    x1 = x11 + center.x;
    y1 = y11 + center.y;
    coordinates[i].x = x1;
    coordinates[i].y = y1;
    coordsMap.set(`${coordinates[i].x},${coordinates[i].y}`, coordinates[i]);
  }
  return [coordinates, coordsMap];
}
const tetrisBlockColor = {
  J: "#FFD700",
  I: "#00BFFF",
  O: "#FFA07A",
  S: "#32CD32",
  Z: "#FF4500",
  T: "#800080",
};
const tetrisBlockColorIndex = {
  1: "J",
  2: "I",
  3: "O",
  4: "S",
  5: "Z",
  6: "T",
};

const tetrisBlockIndex = {
  J: 1,
  I: 2,
  O: 3,
  S: 4,
  Z: 5,
  T: 6,
};

const TETRS_BLOCK = {
  J: "J",
  I: "I",
  O: "O",
  S: "S",
  Z: "Z",
  T: "T",
};
