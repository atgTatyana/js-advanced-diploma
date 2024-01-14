/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    // TODO: выбросите исключение, если кто-то использует "new Character()"
    if (new.target.name === 'Character') {
      throw new Error('Нельзя создавать объект класса Character!');
    }

    if (level < 1 || level > 4) {
      throw new Error('Уровень персонажа должен быть от 1 до 4!');
    }

    this.level = level;
    this.health = 50;
    this.type = type;
  }

  propertyUp(property) {
    return Math.round(Math.max(property, property * ((80 + this.health) / 100)));
  }

  up() {
    if (this.health <= 0) {
      throw new Error('Нельзя повысить уровень умершего!');
    }
    this.attack = this.propertyUp(this.attack);
    this.defence = this.propertyUp(this.defence);
    this.health = this.health + 80 > 100 ? 100 : this.health + 80;
  }

  levelUp() {
    this.level += 1;
  }
}
