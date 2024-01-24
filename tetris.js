const J_BLOCK = ({ coordinate, distance } = { distance: 1 }) => {
  const { x, y } = coordinate;
  return [
    { x, y },
    { x: x, y: y + 3 },
    { x: x + 3, y: y + 3 },
    { x: x + 6, y: y + 3 },
  ]
    .map(getNeighbours)
    .flat();
};

const I_BLOCK = ({ coordinate, distance } = { distance: 1 }) => {
  const { x, y } = coordinate;
  return [
    { x, y },
    { x: x + 3, y },
    { x: x + 6, y },
    { x: x + 9, y },
  ]
    .map(getNeighbours)
    .flat();
};
const T_BLOCK = ({ coordinate, distance } = { distance: 1 }) => {
  const { x, y } = coordinate;
  return [
    { x: x + 3, y },
    { x, y: y + 3 },
    { x: x + 3, y: y + 3 },
    { x: x + 6, y: y + 3 },
  ]
    .map(getNeighbours)
    .flat();
};

const O_BLOCK = ({ coordinate, distance } = { distance: 1 }) => {
  const { x, y } = coordinate;
  return [
    { x, y },
    { x: x + 3, y },
    { x, y: y + 3 },
    { x: x + 3, y: y + 3 },
  ]
    .map(getNeighbours)
    .flat();
};

const S_BLOCK = ({ coordinate, distance } = { distance: 1 }) => {
  const { x, y } = coordinate;
  return [
    { x: x + 3, y },
    { x: x + 6, y },
    { x: x, y: y + 3 },
    { x: x + 3, y: y + 3 },
  ]
    .map(getNeighbours)
    .flat();
};

const Z_BLOCK = ({ coordinate, distance } = { distance: 1 }) => {
  const { x, y } = coordinate;
  return [
    { x, y },
    { x: x + 3, y },
    { x: x + 3, y: y + 3 },
    { x: x + 6, y: y + 3 },
  ]
    .map(getNeighbours)
    .flat();
};

function getNeighbours({ x, y }) {
  return [
    { x: x, y: y },
    { x: x + 1, y: y },
    { x: x - 1, y: y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y + 1 },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y - 1 },
  ];
}
