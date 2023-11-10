import Character from '../Character';

export default class Magician extends Character {
  constructor(level, type = 'magician') {
    super(level, type);
    this.attack = 30;
    this.defence = 40;
  }
}
