export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  remove() {
    this.storage.removeItem('state');
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  saveMaxScore(score) {
    this.storage.setItem('maxScore', JSON.stringify(score));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }

  loadMaxScore() {
    try {
      return JSON.parse(this.storage.getItem('maxScore'));
    } catch (e) {
      throw new Error('Invalid maxScore');
    }
  }
}
