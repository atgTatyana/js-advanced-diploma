import { calcTileType } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [5, 8, 'top'],
  [7, 8, 'top-right'],
  [32, 8, 'left'],
  [23, 8, 'right'],
  [63, 8, 'bottom-right'],
  [56, 8, 'bottom-left'],
  [60, 8, 'bottom'],
  [27, 8, 'center'],
])('testing function calcTileType with index = %i', (index, boardSize, expected) => {
  const result = calcTileType(index, boardSize);
  expect(result).toBe(expected);
});
