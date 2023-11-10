import Character from '../Character';

test('testing that function throws', () => {
  expect(() => {
    const character = new Character(1, 'bowman');
    return character;
  }).toThrow('Нельзя создавать объект класса Character!');
});
