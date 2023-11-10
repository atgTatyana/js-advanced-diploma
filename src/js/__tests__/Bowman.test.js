import Bowman from '../characters/Bowman';
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';
import GameState from '../GameState';

test('testing that function not throws', () => {
  expect(() => {
    const character = new Bowman(2);
    return character;
  }).not.toThrow();
});

test('testing class Bowman', () => {
  const character = new Bowman(1);
  expect(character).toEqual({
    type: 'bowman', health: 50, level: 1, attack: 25, defence: 25,
  });
});

const gamePlay = new GamePlay();
const gameCtrl = new GameController(gamePlay);
gameCtrl.gameState = new GameState(1);
gameCtrl.positions1 = [0, 1, 9];
gameCtrl.positions2 = [6, 7, 14];
gameCtrl.gameState.isPlayer1 = true;

test('testing bowman attack and move', () => {
  const bowman = new Bowman(1);
  gameCtrl.activeCharacter = new PositionedCharacter(bowman, 35);
  gameCtrl.getRanges();
  const result1 = gameCtrl.attackPositions;
  const result2 = gameCtrl.movePositions;
  expect(result1).toEqual([27, 34, 26, 43, 42, 36, 44, 28, 18, 25, 17, 33, 19, 20, 29, 37, 21, 41,
    50, 49, 51, 52, 45, 53]);
  expect(result2).toEqual([27, 34, 26, 43, 42, 36, 44, 28, 18, 25, 17, 33, 19, 20, 29, 37, 21, 41,
    50, 49, 51, 52, 45, 53]);
});
