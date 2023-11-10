import themes from './themes';
import { generateCell, generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import GamePlay from './GamePlay';
import cursors from './cursors';
import Team from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.types1 = ['Bowman', 'Swordsman', 'Magician'];
    this.types2 = ['Vampire', 'Undead', 'Daemon'];
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.maxScore = this.stateService.loadMaxScore();
    if (!this.maxScore) {
      this.maxScore = 0;
    }

    this.gamePlay.drawUi('prairie');
    this.addCursorPointer();

    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  addCursorPointer() {
    this.gamePlay.newGameEl.style.cursor = cursors.pointer;
    this.gamePlay.saveGameEl.style.cursor = cursors.pointer;
    this.gamePlay.loadGameEl.style.cursor = cursors.pointer;
  }

  addListener() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onNewGame() {
    this.currentScore = 0;
    this.positions1 = [];
    this.gameEnd();
    this.addListener();
    this.newGame(1);
  }

  onSaveGame() {
    this.gameState.posChar1 = this.posCharacters1;
    this.gameState.posChar2 = this.posCharacters2;
    this.gameState.currentScore = this.currentScore;
    this.gameState.positions1 = this.positions1;
    this.gameState.positions2 = this.positions2;

    this.stateService.save(this.gameState);
  }

  onLoadGame() {
    try {
      this.state = this.stateService.load();
    } catch (e) {
      GamePlay.showError('Ошибка загрузки state!');
    }

    if (this.state) {
      this.gameEnd();
      this.movePositions = [];

      this.positions1 = this.state.positions1;
      this.positions2 = this.state.positions2;
      this.currentScore = this.state.currentScore;

      const { posChar1, posChar2 } = this.state;
      const team1 = Team.forTeam(posChar1);
      const team2 = Team.forTeam(posChar2);

      this.posCharacters1 = this.getTeamPositionedCharacters(new Team(team1[0]), team1[1]);
      this.posCharacters2 = this.getTeamPositionedCharacters(new Team(team2[0]), team2[1]);
      this.positionedCharacters = [...this.posCharacters1, ...this.posCharacters2];

      this.draw();
      if (this.positions2.length !== 0) {
        this.addListener();
      }
    }

    if (this.state === null) {
      GamePlay.showMessage('Сохранённой игры нет!');
    }
  }

  draw(level = this.state.level) {
    this.getTheme(level);
    this.gamePlay.drawUi(this.theme);
    this.addCursorPointer();

    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.gameState = new GameState(level);
  }

  newGame(level) {
    this.activeCharacter = null;
    this.movePositions = [];
    this.attackPositions = [];

    let characterCount;
    if (level === 1) {
      characterCount = 2;
    } else if (level === 2) {
      characterCount = 3;
    } else {
      characterCount = 5;
    }

    this.getTeams(level, characterCount);
    this.draw(level);
  }

  getTheme(level) {
    switch (level) {
      case 1:
        this.theme = themes.prairie;
        break;
      case 2:
        this.theme = themes.desert;
        break;
      case 3:
        this.theme = themes.arctic;
        break;
      case 4:
        this.theme = themes.mountain;
        break;
      default:
        break;
    }
  }

  getTeams(maxLevel, charCount) {
    this.prevCharacters = [];
    if (this.positions1 && this.positions1.length > 0) {
      this.prevCharacters = this.posCharacters1;
    }

    this.positions1 = this.getTeamPositions(this.gamePlay.team1Positions, charCount);
    this.positions2 = this.getTeamPositions(this.gamePlay.team2Positions, charCount);
    const team2 = generateTeam(this.types2, maxLevel, charCount);

    const team1 = generateTeam(this.types1, maxLevel, charCount - this.prevCharacters.length);
    this.prevCharacters.forEach((el) => {
      team1.characters.push(el.character);
    });

    this.posCharacters1 = this.getTeamPositionedCharacters(team1, this.positions1);
    this.posCharacters2 = this.getTeamPositionedCharacters(team2, this.positions2);
    this.positionedCharacters = [...this.posCharacters1, ...this.posCharacters2];
  }

  getTeamPositions(allPositions, playerCount) {
    this.teamPositions = new Set();
    while (this.teamPositions.size < playerCount) {
      this.teamPositions.add(generateCell(allPositions));
    }
    return [...this.teamPositions];
  }

  getTeamPositionedCharacters(team, teamPositions) {
    this.teamPositionedCharacters = [];
    team.characters.forEach((character, index) => {
      this.teamPositionedCharacters.push(new PositionedCharacter(character, teamPositions[index]));
    });
    return this.teamPositionedCharacters;
  }

  onCellClick(index) {
    // TODO: react to click
    if (this.activeCharacter) {
      const newActiveCharacter = this.posCharacters1.find((el) => el.position === index);
      if (newActiveCharacter) {
        if (newActiveCharacter !== this.activeCharacter) {
          this.getNewActiveCharacter(index, newActiveCharacter);
        }
        return;
      }

      if (this.positions2.includes(index) && this.attackPositions.includes(index)) {
        console.log('attack! ', index);
        this.damage(index);
      } else if (this.movePositions.includes(index) && !this.positions2.includes(index)) {
        console.log('move! ', index);
        this.move(index);
      } else {
        console.log('Недопустимый ход!');
      }
    } else {
      this.getActiveCharacter(index);
    }
  }

  changePlayer(oldPosition = null) {
    this.deleteDisplay();

    if (oldPosition !== null) {
      this.gamePlay.deselectCell(oldPosition);
    }

    this.movePositions = [];
    this.attackPositions = [];
    const oldActiveCharacter = this.activeCharacter;
    this.activeCharacter = null;

    this.gameState.changeIsPlayer1();
    if (!this.gameState.isPlayer1) {
      this.player2(oldActiveCharacter);
    }
  }

  getActiveCharacter(index) {
    this.activeCharacter = this.posCharacters1.find((el) => el.position === index);
    if (this.activeCharacter) {
      this.getDisplay(index);
    } else {
      GamePlay.showError('Выберите, пожалуйста, своего персонажа!');
    }
  }

  getDisplay(index) {
    this.gamePlay.selectCell(index);
    const otherCharacters = this.posCharacters1.filter((el) => el.position !== index);
    otherCharacters.forEach((el) => {
      this.gamePlay.cells[el.position].style.cursor = cursors.pointer;
    });

    this.getRanges();

    this.movePositions.forEach((cell) => {
      this.gamePlay.cells[cell].style.cursor = cursors.pointer;
    });

    this.attackPositions.forEach((cell) => {
      this.gamePlay.cells[cell].style.border = '1px solid yellow';
    });

    this.posCharacters2.forEach((el) => {
      if (this.attackPositions.includes(el.position)) {
        this.gamePlay.cells[el.position].style.cursor = cursors.crosshair;
      } else {
        this.gamePlay.cells[el.position].style.cursor = cursors.notallowed;
      }
    });
  }

  deleteDisplay() {
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      this.gamePlay.cells[i].style.cursor = cursors.auto;
      this.gamePlay.deselectCell(i);
    }

    this.attackPositions.forEach((cell) => {
      this.gamePlay.cells[cell].style.border = '';
    });
  }

  getNewActiveCharacter(index, newActiveCharacter) {
    this.deleteDisplay();
    this.activeCharacter = newActiveCharacter;
    this.getDisplay(index);
  }

  getRanges() {
    const { type } = this.activeCharacter.character;
    const { position } = this.activeCharacter;
    this.cellsPositions = new Set(this.getRange1(position));

    if (type === 'bowman' || type === 'vampire') {
      const cell2 = new Set(this.centers);
      cell2.delete(null);
      this.getRange2(cell2);
      this.cellsPositions.delete(position);
      this.attackPositions = [...this.cellsPositions];
      this.movePositions = [...this.cellsPositions];
      this.deletePosition();
      return;
    }

    if (type === 'swordsman' || type === 'undead') {
      this.attackPositions = [...this.cellsPositions];
    }

    if (type === 'magician' || type === 'daemon') {
      this.movePositions = [...this.cellsPositions];
    }

    const cell2 = new Set(this.centers);
    cell2.delete(null);
    const cell3 = new Set();
    this.getRange3(cell2, cell3);
    cell3.delete(position);
    cell3.delete(null);

    const cell4 = new Set();
    this.getRange3(cell3, cell4);
    cell4.delete(null);

    this.getRange2(cell4);
    this.cellsPositions.delete(position);

    if (type === 'swordsman' || type === 'undead') {
      this.movePositions = [...this.cellsPositions];
    }

    if (type === 'magician' || type === 'daemon') {
      this.attackPositions = [...this.cellsPositions];
    }

    this.deletePosition();
  }

  getRange1(position) {
    const { boardSize } = this.gamePlay;
    const arr = [];
    this.centers = [];
    let top = false;
    let bottom = false;
    let left = false;
    let topLeft = null;
    let topRight = null;
    let bottomLeft = null;
    let bottomRight = null;

    if (position - boardSize >= 0) {
      arr.push(position - boardSize);
      top = true;
    }

    if (position % boardSize !== 0) {
      arr.push(position - 1);
      if (top) {
        topLeft = position - boardSize - 1;
        arr.push(topLeft);
      }
      left = true;
    }

    if (position + boardSize < boardSize ** 2) {
      arr.push(position + boardSize);
      if (left) {
        bottomLeft = position + boardSize - 1;
        arr.push(bottomLeft);
      }
      bottom = true;
    }

    if ((position + 1) % boardSize !== 0) {
      arr.push(position + 1);
      if (bottom) {
        bottomRight = position + boardSize + 1;
        arr.push(bottomRight);
      }
      if (top) {
        topRight = position - boardSize + 1;
        arr.push(topRight);
      }
    }

    this.centers = [topLeft, topRight, bottomLeft, bottomRight];
    return arr;
  }

  getRange2(centers) {
    centers.forEach((el) => {
      const arr = this.getRange1(el, this.gamePlay.boardSize);
      arr.forEach((ar) => this.cellsPositions.add(ar));
    });
  }

  getRange3(centers1, centers2) {
    centers1.forEach((el) => {
      const arr = this.getRange1(el, this.gamePlay.boardSize);
      arr.forEach((ar) => this.cellsPositions.add(ar));
      this.centers.forEach((center) => { centers2.add(center); });
    });
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.positions1.includes(index) || this.positions2.includes(index)) {
      const characterInfo = this.getCharacterInfo(index);
      this.gamePlay.showCellTooltip(characterInfo, index);
    } else if (this.movePositions && this.movePositions.includes(index)) {
      this.gamePlay.selectCell(index, 'green');
    }

    if (this.attackPositions && this.attackPositions.includes(index)
      && this.positions2.includes(index)) {
      this.gamePlay.selectCell(index, 'red');
    }
  }

  getCharacterInfo(index) {
    this.characterEnter = this.positionedCharacters.find((el) => el.position === index);
    const hero = this.characterEnter.character;
    const info = `\u{1F396} ${hero.level}  \u2694 ${hero.attack}  \u{1F6E1} ${hero.defence}  \u2764 ${hero.health}`;
    return info;
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    if (this.activeCharacter && this.activeCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  player2(oldActiveCharacter) {
    const attack1 = [];
    const attack2 = [];

    if (this.target) {
      this.newAttack = oldActiveCharacter.position;
    }

    for (let i = 0; i < this.posCharacters2.length; i += 1) {
      this.activeCharacter = this.posCharacters2[i];
      this.getRanges();

      if (this.target && this.attackPositions.includes(this.newAttack)) {
        attack1.push(this.posCharacters2[i]);
      } else {
        this.positions1.forEach((position) => {
          if (this.attackPositions.includes(position)) {
            attack2.push({
              target: position,
              char: this.posCharacters2[i],
            });
          }
        });
      }
    }

    if (attack1.length) {
      attack1.sort((a, b) => b.character.attack - a.character.attack);
      console.log('Атакует напавшего персонажа!');
      this.damage(oldActiveCharacter, attack1[0].character);
      this.target = null;
      return;
    }

    if (attack2.length) {
      attack2.sort((a, b) => b.char.character.attack - a.char.character.attack);
      const target = this.posCharacters1.find((el) => el.position === attack2[0].target);
      this.damage(target, attack2[0].char.character);
      this.target = null;
      return;
    }

    const moveChar = this.choiceMoveCharacter();
    this.choiceMovePosition(...moveChar);
  }

  deletePosition() {
    const positions = [...this.positions1, ...this.positions2];
    positions.forEach((position) => {
      this.movePositions = this.movePositions.filter((pos) => pos !== position);
    });

    if (this.gameState.isPlayer1) {
      this.positions1.forEach((position) => {
        this.attackPositions = this.attackPositions.filter((pos) => pos !== position);
      });
    } else {
      this.positions2.forEach((position) => {
        this.attackPositions = this.attackPositions.filter((pos) => pos !== position);
      });
    }
  }

  choiceMoveCharacter() {
    // Будет ходить персонаж, который ближе всего к противнику
    const arr = [];
    for (let i = 0; i < this.positions1.length; i += 1) {
      const col = this.positions1[i] % this.gamePlay.boardSize;
      const row = Math.floor(this.positions1[i] / this.gamePlay.boardSize);
      arr[i] = [col, row];
    }

    const arr1 = [];
    for (let i = 0; i < this.positions2.length; i += 1) {
      const col = this.positions2[i] % this.gamePlay.boardSize;
      const row = Math.floor(this.positions2[i] / this.gamePlay.boardSize);
      for (let j = 0; j < arr.length; j += 1) {
        const x = col - arr[j][0] < 0 ? -(col - arr[j][0]) : col - arr[j][0];
        const y = row - arr[j][1] < 0 ? -(row - arr[j][1]) : row - arr[j][1];
        arr1.push([this.positions2[i], this.positions1[j], arr[j], x + y]);
      }
    }

    arr1.sort((a, b) => a[3] - b[3]);
    return arr1[0];
  }

  choiceMovePosition(moveChar, target, arr) {
    // Выбирается позиция ближайшая к противнику
    this.activeCharacter = this.posCharacters2.find((el) => el.position === moveChar);
    this.getRanges();

    const arr1 = [];
    let arr2 = [];
    const arr3 = [];
    this.movePositions.forEach((el) => {
      const col = el % this.gamePlay.boardSize;
      const x = col - arr[0] < 0 ? -(col - arr[0]) : col - arr[0];
      arr1.push([el, x]);
    });
    arr1.sort((a, b) => a[1] - b[1]);
    arr2 = arr1.filter((el) => el[1] === arr1[0][1]);

    arr2.forEach((el) => {
      const row = Math.floor(el[0] / this.gamePlay.boardSize);
      const y = row - arr[1] < 0 ? -(row - arr[1]) : row - arr[1];
      arr3.push([el[0], y]);
    });
    arr3.sort((a, b) => a[1] - b[1]);

    this.move(arr3[0][0]);
  }

  damage(index, attacker = this.activeCharacter.character) {
    const { attack } = attacker;
    if (this.gameState.isPlayer1) {
      this.target = this.posCharacters2.find((el) => el.position === index);
    } else {
      this.target = index;
    }

    const damage = Math.round(Math.max(attack - this.target.character.defence, attack * 0.1));
    if (this.gameState.isPlayer1) {
      this.gamePlay.showDamage(index, damage);
    } else {
      this.gamePlay.showDamage(index.position, damage);
    }

    this.target.character.health -= damage;

    if (this.target.character.health <= 0) {
      if (this.positions1.includes(this.target.position)) {
        this.positions1 = this.positions1.filter((el) => el !== this.target.position);
        this.posCharacters1 = this.posCharacters1
          .filter((el) => el.position !== this.target.position);
      } else {
        this.positions2 = this.positions2.filter((el) => el !== this.target.position);
        this.posCharacters2 = this.posCharacters2
          .filter((el) => el.position !== this.target.position);
        this.currentScore += 10;
      }

      this.positionedCharacters = this.positionedCharacters
        .filter((el) => el.position !== this.target.position);
    }

    setTimeout(() => {
      this.gamePlay.redrawPositions(this.positionedCharacters);
      if (this.positions2.length === 0) {
        if (this.gameState.level === 4) {
          console.log('ПОБЕДА!');
          this.deleteDisplay();
          this.gameEnd();
          return;
        }

        this.posCharacters1.forEach((el) => {
          el.character.levelUp();
          el.character.up();
        });

        this.newGame(this.gameState.level + 1);
      } else if (this.positions1.length === 0) {
        console.log('Вы проиграли!');
        this.gameEnd();
      } else {
        this.changePlayer();
      }
    }, 500);
  }

  move(index) {
    const { position } = this.activeCharacter;
    const oldPosition = position;
    if (this.gameState.isPlayer1) {
      this.positions1.splice(this.positions1.indexOf(position), 1, index);
      const movedPosition = this.posCharacters1.indexOf(this.activeCharacter);
      this.posCharacters1[movedPosition].position = index;
    } else {
      this.positions2.splice(this.positions2.indexOf(position), 1, index);
      const movedPosition = this.posCharacters2.indexOf(this.activeCharacter);
      this.posCharacters2[movedPosition].position = index;
    }

    this.positionedCharacters = [...this.posCharacters1, ...this.posCharacters2];
    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.changePlayer(oldPosition);
  }

  gameEnd() {
    this.activeCharacter = null;
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellClickListeners = [];

    if (this.currentScore) {
      this.maxScore = Math.max(this.maxScore, this.currentScore);
      this.stateService.saveMaxScore(this.maxScore);
    }
  }
}
