/**
 * авто-тест с моком для метода load, который проверяет реакцию приложения на успешную
 * и не успешную загрузку из локального хранилища браузера
 */
import GameStateService from '../GameStateService';
import GamePlay from '../GamePlay';
import GameController from '../GameController';

const gamePlay = new GamePlay();
const stateService = new GameStateService();
const gameCtrl = new GameController(gamePlay, stateService);

jest.mock('../GameStateService');
jest.mock('../GamePlay');

beforeEach(() => {
  jest.resetAllMocks();
});

test('testing function load with error', () => {
  stateService.load.mockReturnValue(new Error('Invalid state'));
  gameCtrl.onLoadGame();

  expect(GamePlay.showError).toHaveBeenCalled();
  expect(stateService.load).toHaveBeenCalled();
});

test('testing function load', () => {
  const spy = jest.spyOn(gameCtrl, 'draw');
  spy.mockReturnValue('draw');

  stateService.load.mockReturnValue({
    currentScore: 20,
    isPlayer: true,
    level: 2,
    playerPositionedCharacters: [
      {
        character: {
          level: 2, health: 100, type: 'bowman', attack: 33, defence: 33,
        },
        position: 8,
      },
      {
        character: {
          level: 2, health: 100, type: 'magician', attack: 39, defence: 52,
        },
        position: 17,
      },
      {
        character: {
          level: 2, health: 88, type: 'bowman', attack: 25, defence: 25,
        },
        position: 24,
      },
    ],
    pcPositionedCharacters: [
      {
        character: {
          level: 2, health: 100, type: 'vampire', attack: 33, defence: 33,
        },
        position: 14,
      },
      {
        character: {
          level: 1, health: 50, type: 'undead', attack: 40, defence: 10,
        },
        position: 55,
      },
      {
        character: {
          level: 2, health: 100, type: 'undead', attack: 52, defence: 13,
        },
        position: 38,
      },
    ],
    playerPositions: [8, 17, 24],
    pcPositions: [14, 55, 38],
  });

  gameCtrl.onLoadGame();
  expect(stateService.load).toHaveBeenCalled();
  expect(spy).toHaveBeenCalled();
  expect(gameCtrl.state).toBeDefined();

  expect(gameCtrl.state).toEqual({
    currentScore: 20,
    isPlayer: true,
    level: 2,
    playerPositionedCharacters: [
      {
        character: {
          level: 2, health: 100, type: 'bowman', attack: 33, defence: 33,
        },
        position: 8,
      },
      {
        character: {
          level: 2, health: 100, type: 'magician', attack: 39, defence: 52,
        },
        position: 17,
      },
      {
        character: {
          level: 2, health: 88, type: 'bowman', attack: 25, defence: 25,
        },
        position: 24,
      },
    ],
    pcPositionedCharacters: [
      {
        character: {
          level: 2, health: 100, type: 'vampire', attack: 33, defence: 33,
        },
        position: 14,
      },
      {
        character: {
          level: 1, health: 50, type: 'undead', attack: 40, defence: 10,
        },
        position: 55,
      },
      {
        character: {
          level: 2, health: 100, type: 'undead', attack: 52, defence: 13,
        },
        position: 38,
      },
    ],
    playerPositions: [8, 17, 24],
    pcPositions: [14, 55, 38],
  });
});
