import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class GameState {
  constructor(level) {
    this.isPlayer = true;
    this.level = level;
  }

  changeIsPlayer() {
    this.isPlayer = !this.isPlayer;
  }

  static configure(
    playerPositionedCharacters,
    pcPositionedCharacters,
    currentScore,
    playerPositions,
    pcPositions,
    level,
  ) {
    // TODO: create object
    return {
      playerPositionedCharacters,
      pcPositionedCharacters,
      currentScore,
      playerPositions,
      pcPositions,
      level,
    };
  }

  static from(char) {
    let character;
    switch (char.type) {
      case 'bowman':
        character = new Bowman(char.level);
        break;
      case 'daemon':
        character = new Daemon(char.level);
        break;
      case 'magician':
        character = new Magician(char.level);
        break;
      case 'swordsman':
        character = new Swordsman(char.level);
        break;
      case 'undead':
        character = new Undead(char.level);
        break;
      case 'vampire':
        character = new Vampire(char.level);
        break;
      default:
        break;
    }
    character.health = char.health;
    character.attack = char.attack;
    character.defence = char.defence;
    return character;
  }
}
