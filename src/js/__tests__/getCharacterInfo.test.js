import Vampire from '../characters/Vampire';
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';

const gamePlay = new GamePlay();
const gameCtrl = new GameController(gamePlay);

test('testing function getCharacterInfo', () => {
  const vampire = new Vampire(1);
  gameCtrl.positionedCharacters = [new PositionedCharacter(vampire, 16)];

  const result = gameCtrl.getCharacterInfo(16);
  expect(result).toBe('🎖 1  ⚔ 25  🛡 25  ❤ 50');
});
