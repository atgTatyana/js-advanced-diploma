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
    this.playerTypes = ['Bowman', 'Swordsman', 'Magician'];
    this.pcTypes = ['Vampire', 'Undead', 'Daemon'];
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
    this.playerPositions = [];
    this.gameEnd();
    this.addListener();
    this.newGame(1);
  }

  onSaveGame() {
    if (this.playerPositions) {
      const state = GameState.configure(
        this.playerPositionedCharacters,
        this.pcPositionedCharacters,
        this.currentScore,
        this.playerPositions,
        this.pcPositions,
        this.gameState.level,
      );
      this.stateService.save(state);
    }
  }

  onLoadGame() {
    try {
      this.state = this.stateService.load();
      if (this.state) {
        this.gameEnd();
        this.movePositions = [];

        this.playerPositions = this.state.playerPositions;
        this.pcPositions = this.state.pcPositions;
        this.currentScore = this.state.currentScore;

        const { playerPositionedCharacters, pcPositionedCharacters } = this.state;
        const playerTeam = Team.forTeam(playerPositionedCharacters);
        const pcTeam = Team.forTeam(pcPositionedCharacters);

        this.playerPositionedCharacters = this.getTeamPositionedCharacters(
          new Team(playerTeam[0]),
          playerTeam[1],
        );
        this.pcPositionedCharacters = this.getTeamPositionedCharacters(
          new Team(pcTeam[0]),
          pcTeam[1],
        );
        this.positionedCharacters = [
          ...this.playerPositionedCharacters,
          ...this.pcPositionedCharacters,
        ];

        this.draw();
        if (this.pcPositions.length !== 0) {
          this.addListener();
        }
      }
    } catch (e) {
      GamePlay.showError('Ошибка загрузки state!');
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

  getTeams(maxLevel, characterCount) {
    this.prevCharacters = [];
    if (this.playerPositions && this.playerPositions.length > 0) {
      this.prevCharacters = this.playerPositionedCharacters;
    }

    this.playerPositions = this.getTeamPositions(this.gamePlay.playerTeamPositions, characterCount);
    this.pcPositions = this.getTeamPositions(this.gamePlay.pcTeamPositions, characterCount);
    const pcTeam = generateTeam(this.pcTypes, maxLevel, characterCount);
    const playerTeam = generateTeam(
      this.playerTypes,
      maxLevel,
      characterCount - this.prevCharacters.length,
    );

    this.prevCharacters.forEach((el) => {
      playerTeam.characters.push(el.character);
    });

    this.playerPositionedCharacters = this.getTeamPositionedCharacters(
      playerTeam,
      this.playerPositions,
    );
    this.pcPositionedCharacters = this.getTeamPositionedCharacters(pcTeam, this.pcPositions);
    this.positionedCharacters = [
      ...this.playerPositionedCharacters,
      ...this.pcPositionedCharacters,
    ];
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
      const newActiveCharacter = this.playerPositionedCharacters
        .find((el) => el.position === index);
      if (newActiveCharacter) {
        if (newActiveCharacter !== this.activeCharacter) {
          this.getNewActiveCharacter(index, newActiveCharacter);
        }
        return;
      }

      if (this.pcPositions.includes(index) && this.attackPositions.includes(index)) {
        console.log('attack! ', index);
        this.damage(index);
      } else if (this.movePositions.includes(index) && !this.pcPositions.includes(index)) {
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

    this.gameState.changeIsPlayer();
    if (!this.gameState.isPlayer) {
      this.pcMove(oldActiveCharacter);
    }
  }

  getActiveCharacter(index) {
    this.activeCharacter = this.playerPositionedCharacters.find((el) => el.position === index);
    if (this.activeCharacter) {
      this.getDisplay(index);
    } else {
      GamePlay.showError('Выберите другого персонажа!');
    }
  }

  getDisplay(index) {
    this.gamePlay.selectCell(index);
    const otherCharacters = this.playerPositionedCharacters.filter((el) => el.position !== index);
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

    this.pcPositionedCharacters.forEach((el) => {
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
    this.cellsPositions = new Set(this.getRange1Cell(position));

    if (type === 'bowman' || type === 'vampire') {
      const centers = new Set(this.centers);
      centers.delete(null);
      this.getRange2Cell(centers);
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

    const centers = new Set(this.centers);
    centers.delete(null);
    const centersNext = new Set();
    this.getRange3Cell(centers, centersNext);
    centersNext.delete(position);
    centersNext.delete(null);

    const centersLast = new Set();
    this.getRange3Cell(centersNext, centersLast);
    centersLast.delete(null);

    this.getRange2Cell(centersLast);
    this.cellsPositions.delete(position);

    if (type === 'swordsman' || type === 'undead') {
      this.movePositions = [...this.cellsPositions];
    }

    if (type === 'magician' || type === 'daemon') {
      this.attackPositions = [...this.cellsPositions];
    }

    this.deletePosition();
  }

  getRange1Cell(position) {
    const { boardSize } = this.gamePlay;
    const range1Cell = [];
    this.centers = [];
    let top = false;
    let bottom = false;
    let left = false;
    let topLeft = null;
    let topRight = null;
    let bottomLeft = null;
    let bottomRight = null;

    if (position - boardSize >= 0) {
      range1Cell.push(position - boardSize);
      top = true;
    }

    if (position % boardSize !== 0) {
      range1Cell.push(position - 1);
      if (top) {
        topLeft = position - boardSize - 1;
        range1Cell.push(topLeft);
      }
      left = true;
    }

    if (position + boardSize < boardSize ** 2) {
      range1Cell.push(position + boardSize);
      if (left) {
        bottomLeft = position + boardSize - 1;
        range1Cell.push(bottomLeft);
      }
      bottom = true;
    }

    if ((position + 1) % boardSize !== 0) {
      range1Cell.push(position + 1);
      if (bottom) {
        bottomRight = position + boardSize + 1;
        range1Cell.push(bottomRight);
      }
      if (top) {
        topRight = position - boardSize + 1;
        range1Cell.push(topRight);
      }
    }

    this.centers = [topLeft, topRight, bottomLeft, bottomRight];
    return range1Cell;
  }

  getRange2Cell(centers) {
    centers.forEach((el) => {
      const range = this.getRange1Cell(el);
      range.forEach((cell) => this.cellsPositions.add(cell));
    });
  }

  getRange3Cell(centers, centersNext) {
    centers.forEach((el) => {
      const range = this.getRange1Cell(el);
      range.forEach((cell) => this.cellsPositions.add(cell));
      this.centers.forEach((center) => { centersNext.add(center); });
    });
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.playerPositions.includes(index) || this.pcPositions.includes(index)) {
      const characterInfo = this.getCharacterInfo(index);
      this.gamePlay.showCellTooltip(characterInfo, index);
    } else if (this.movePositions && this.movePositions.includes(index)) {
      this.gamePlay.selectCell(index, 'green');
    }

    if (this.attackPositions && this.attackPositions.includes(index)
      && this.pcPositions.includes(index)) {
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

  pcMove(oldActiveCharacter) {
    const charactersToAttackTheAttacker = [];
    const charactersToAttack = [];

    if (this.target) {
      this.newAttack = oldActiveCharacter.position;
    }

    for (let i = 0; i < this.pcPositionedCharacters.length; i += 1) {
      this.activeCharacter = this.pcPositionedCharacters[i];
      this.getRanges();

      if (this.target && this.attackPositions.includes(this.newAttack)) {
        charactersToAttackTheAttacker.push(this.pcPositionedCharacters[i]);
      } else {
        this.playerPositions.forEach((position) => {
          if (this.attackPositions.includes(position)) {
            charactersToAttack.push({
              target: position,
              char: this.pcPositionedCharacters[i],
            });
          }
        });
      }
    }

    // ПК атакует напавшего персонажа с наибольшим уроном
    if (charactersToAttackTheAttacker.length) {
      charactersToAttackTheAttacker.sort((a, b) => b.character.attack - a.character.attack);
      this.damage(oldActiveCharacter, charactersToAttackTheAttacker[0].character);
      this.target = null;
      return;
    }

    // ПК атакует персонажа, доступного для атаки, с наибольшим уроном
    if (charactersToAttack.length) {
      charactersToAttack.sort((a, b) => b.char.character.attack - a.char.character.attack);
      const target = this.playerPositionedCharacters
        .find((el) => el.position === charactersToAttack[0].target);
      this.damage(target, charactersToAttack[0].char.character);
      this.target = null;
      return;
    }

    const moveCharacter = this.pcChoiceMoveCharacter();
    this.pcChoiceMovePosition(...moveCharacter);
  }

  deletePosition() {
    const positions = [...this.playerPositions, ...this.pcPositions];
    positions.forEach((position) => {
      this.movePositions = this.movePositions.filter((pos) => pos !== position);
    });

    if (this.gameState.isPlayer) {
      this.playerPositions.forEach((position) => {
        this.attackPositions = this.attackPositions.filter((pos) => pos !== position);
      });
    } else {
      this.pcPositions.forEach((position) => {
        this.attackPositions = this.attackPositions.filter((pos) => pos !== position);
      });
    }
  }

  pcChoiceMoveCharacter() {
    // Будет ходить персонаж, который ближе всего к противнику
    const playerColRow = [];
    for (let i = 0; i < this.playerPositions.length; i += 1) {
      const col = this.playerPositions[i] % this.gamePlay.boardSize;
      const row = Math.floor(this.playerPositions[i] / this.gamePlay.boardSize);
      playerColRow[i] = [col, row];
    }

    const distance = [];
    for (let i = 0; i < this.pcPositions.length; i += 1) {
      const col = this.pcPositions[i] % this.gamePlay.boardSize;
      const row = Math.floor(this.pcPositions[i] / this.gamePlay.boardSize);
      for (let j = 0; j < playerColRow.length; j += 1) {
        const x = col - playerColRow[j][0] < 0
          ? -(col - playerColRow[j][0]) : col - playerColRow[j][0];
        const y = row - playerColRow[j][1] < 0
          ? -(row - playerColRow[j][1]) : row - playerColRow[j][1];
        distance.push([this.pcPositions[i], this.playerPositions[j], playerColRow[j], x + y]);
      }
    }

    distance.sort((a, b) => a[3] - b[3]);
    return distance[0];
  }

  pcChoiceMovePosition(moveCharacter, target, playerColRow) {
    // Выбирается позиция ближайшая к противнику
    this.activeCharacter = this.pcPositionedCharacters.find((el) => el.position === moveCharacter);
    this.getRanges();

    const distanceCol = [];
    let distanceColMin = [];
    const distanceRow = [];
    this.movePositions.forEach((el) => {
      const col = el % this.gamePlay.boardSize;
      const distCol = col - playerColRow[0] < 0 ? -(col - playerColRow[0]) : col - playerColRow[0];
      distanceCol.push([el, distCol]);
    });
    distanceCol.sort((a, b) => a[1] - b[1]);
    distanceColMin = distanceCol.filter((el) => el[1] === distanceCol[0][1]);

    distanceColMin.forEach((el) => {
      const row = Math.floor(el[0] / this.gamePlay.boardSize);
      const distRow = row - playerColRow[1] < 0 ? -(row - playerColRow[1]) : row - playerColRow[1];
      distanceRow.push([el[0], distRow]);
    });
    distanceRow.sort((a, b) => a[1] - b[1]);

    this.move(distanceRow[0][0]);
  }

  damage(index, attacker = this.activeCharacter.character) {
    const { attack } = attacker;
    if (this.gameState.isPlayer) {
      this.target = this.pcPositionedCharacters.find((el) => el.position === index);
    } else {
      this.target = index;
    }

    const damage = Math.round(Math.max(attack - this.target.character.defence, attack * 0.1));
    if (this.gameState.isPlayer) {
      this.gamePlay.showDamage(index, damage);
    } else {
      this.gamePlay.showDamage(index.position, damage);
    }

    this.target.character.health -= damage;

    if (this.target.character.health <= 0) {
      if (this.playerPositions.includes(this.target.position)) {
        this.playerPositions = this.playerPositions.filter((el) => el !== this.target.position);
        this.playerPositionedCharacters = this.playerPositionedCharacters
          .filter((el) => el.position !== this.target.position);
      } else {
        this.pcPositions = this.pcPositions.filter((el) => el !== this.target.position);
        this.pcPositionedCharacters = this.pcPositionedCharacters
          .filter((el) => el.position !== this.target.position);
        this.currentScore += 10;
      }

      this.positionedCharacters = this.positionedCharacters
        .filter((el) => el.position !== this.target.position);
    }

    setTimeout(() => {
      this.gamePlay.redrawPositions(this.positionedCharacters);
      if (this.pcPositions.length === 0) {
        if (this.gameState.level === 4) {
          console.log('ПОБЕДА!');
          this.deleteDisplay();
          this.gameEnd();
          return;
        }

        this.playerPositionedCharacters.forEach((el) => {
          el.character.levelUp();
          el.character.up();
        });

        this.newGame(this.gameState.level + 1);
      } else if (this.playerPositions.length === 0) {
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

    const moveIndex = (positions, positionedCharacters) => {
      positions.splice(positions.indexOf(position), 1, index);
      const movedPosition = positionedCharacters.indexOf(this.activeCharacter);
      positionedCharacters[movedPosition].position = index;
    };
    if (this.gameState.isPlayer) {
      moveIndex(this.playerPositions, this.playerPositionedCharacters);
    } else {
      moveIndex(this.pcPositions, this.pcPositionedCharacters);
    }
    // if (this.gameState.isPlayer) {
    //   this.playerPositions.splice(this.playerPositions.indexOf(position), 1, index);
    //   const movedPosition = this.playerPositionedCharacters.indexOf(this.activeCharacter);
    //   this.playerPositionedCharacters[movedPosition].position = index;
    // } else {
    //   this.pcPositions.splice(this.pcPositions.indexOf(position), 1, index);
    //   const movedPosition = this.pcPositionedCharacters.indexOf(this.activeCharacter);
    //   this.pcPositionedCharacters[movedPosition].position = index;
    // }

    this.positionedCharacters = [
      ...this.playerPositionedCharacters,
      ...this.pcPositionedCharacters,
    ];
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
