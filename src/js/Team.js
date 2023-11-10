import GameState from './GameState';
/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here
  constructor(characters) {
    this.characters = characters;
  }

  static forTeam(posChar) {
    const team = [];
    const pos = [];
    let character;

    for (let i = 0; i < posChar.length; i += 1) {
      character = GameState.from(posChar[i].character);
      team.push(character);
      pos.push(posChar[i].position);
    }
    return [team, pos];
  }
}
