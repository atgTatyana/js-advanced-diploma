import Swordsman from '../characters/Swordsman';
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';
import GameState from '../GameState';

test('testing that function not throws', () => {
  expect(() => {
    const character = new Swordsman(2);
    return character;
  }).not.toThrow();
});

test('testing class Swordsman', () => {
  const character = new Swordsman(1);
  expect(character).toEqual({
    type: 'swordsman', health: 50, level: 1, attack: 40, defence: 10,
  });
});

const gamePlay = new GamePlay();
const gameCtrl = new GameController(gamePlay);
gameCtrl.gameState = new GameState(1);
gameCtrl.playerPositions = [0, 1, 9];
gameCtrl.pcPositions = [6, 7, 14];
gameCtrl.gameState.isPlayer = true;

test('testing swordsman attack and move', () => {
  const swordsman = new Swordsman(1);
  gameCtrl.activeCharacter = new PositionedCharacter(swordsman, 35);
  gameCtrl.getRanges();
  const result1 = gameCtrl.attackPositions;
  const result2 = gameCtrl.movePositions;
  expect(result1).toEqual([27, 34, 26, 43, 42, 36, 44, 28]);
  expect(result2).toEqual([27, 34, 26, 43, 42, 36, 44, 28, 18, 25, 17, 33, 19, 20, 29, 37, 21, 41,
    50, 49, 51, 52, 45, 53, 16, 8, 24, 10, 11, 12, 32, 40, 13, 22, 30, 38, 46, 48, 57, 56, 58, 59,
    60, 61, 54, 62, 2, 3, 4, 5, 15, 23, 31, 39, 47, 55, 63]);
});
