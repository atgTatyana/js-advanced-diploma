import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.position = position;
  }

  static getPositionsTeam1(boardSize) {
    let pos = 0;
    const positions = [0, 1];
    for (let i = 0; i < boardSize - 1; i += 1) {
      pos += boardSize;
      positions.push(pos);
      positions.push(pos + 1);
    }
    return positions;
  }

  static getPositionsTeam2(boardSize) {
    let pos = boardSize - 2;
    const positions = [pos, pos + 1];
    for (let i = 0; i < boardSize - 1; i += 1) {
      pos += boardSize;
      positions.push(pos);
      positions.push(pos + 1);
    }
    return positions;
  }
}
