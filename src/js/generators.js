/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
import Team from './Team';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    const randomIndex = Math.floor(Math.random() * allowedTypes.length);
    const ramdomCharacter = allowedTypes[randomIndex];
    const randomLevel = Math.floor(Math.random() * maxLevel) + 1;

    switch (ramdomCharacter) {
      case 'Bowman':
        yield new Bowman(randomLevel);
        break;
      case 'Daemon':
        yield new Daemon(randomLevel);
        break;
      case 'Magician':
        yield new Magician(randomLevel);
        break;
      case 'Swordsman':
        yield new Swordsman(randomLevel);
        break;
      case 'Undead':
        yield new Undead(randomLevel);
        break;
      case 'Vampire':
        yield new Vampire(randomLevel);
        break;
      default:
        break;
    }
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей.
 * Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const playerGenerator = characterGenerator(allowedTypes, maxLevel);
  const characters = [];

  for (let i = 0; i < characterCount; i += 1) {
    characters[i] = playerGenerator.next().value;

    for (let j = 1; j < characters[i].level; j += 1) {
      characters[i].up();
    }
  }

  return new Team(characters);
}

export function generateCell(positions) {
  const randomIndex = Math.floor(Math.random() * positions.length);
  return positions[randomIndex];
}
