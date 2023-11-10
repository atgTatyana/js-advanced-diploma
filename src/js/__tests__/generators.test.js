import { characterGenerator, generateTeam } from '../generators';

test('testing function characterGenerator for team1', () => {
  const allowedTypes = ['Bowman', 'Swordsman', 'Magician'];
  const playerGenerator = characterGenerator(allowedTypes, 1);
  const character = playerGenerator.next().value;
  expect(['bowman', 'swordsman', 'magician']).toContain(character.type);
});

test('testing function characterGenerator for team2', () => {
  const allowedTypes = ['Vampire', 'Undead', 'Daemon'];
  const playerGenerator = characterGenerator(allowedTypes, 1);
  const character = playerGenerator.next().value;
  expect(['vampire', 'undead', 'daemon']).toContain(character.type);
});

test('testing function generateTeam, length', () => {
  const allowedTypes = ['Bowman', 'Swordsman', 'Magician'];
  const team = generateTeam(allowedTypes, 2, 3);
  expect(team.characters.length).toBe(3);
});

test('testing function generateTeam, level', () => {
  const allowedTypes = ['Bowman', 'Swordsman', 'Magician'];
  const team = generateTeam(allowedTypes, 3, 1);
  expect([1, 2, 3]).toContain(team.characters[0].level);
});
