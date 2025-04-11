import Bree from './Bree.js';
import { openMenu, MenuScene } from '../scenes/MenuScene.js';

export default class Bard extends Bree {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.className = 'Bard';
    this.hp = 60;
    this.maxHp = 60;
    this.rhythmGameScore = 0;
  }

  playRhythmGame() {
    console.log("Bard is playing the rhythm game!");
    // Simple rhythm game logic: use Phaser's time events to create a rhythm
    this.rhythmGameScore = Math.floor(Math.random() * 100); // Random score for now, could be based on player input
    console.log("Rhythm score: " + this.rhythmGameScore);
  }

  enterCombat(target) {
    openMenu(this.scene, {
      prompt: "Bard needs to play a rhythm game to deal damage. Let's go!",
      options: {
        "Start Rhythm Game": () => this.startRhythmGame(target),
        "Flee": () => this.fleeCombat()
      },
      callback: (selectedAction) => {
        selectedAction();
      }
    });
  }

  startRhythmGame(target) {
    console.log('Bard starts the rhythm game...');
    this.playRhythmGame();
    this.dealRhythmDamage(target);
  }

  dealRhythmDamage(target) {
    const damage = this.rhythmGameScore;
    console.log(`Bard deals ${damage} damage based on rhythm game score!`);
    target.takeDamage(damage); // Deal damage based on rhythm score
  }

  fleeCombat() {
    console.log('Bard flees the combat!');
    // Add logic to exit the combat scene or reset the encounter
  }
}
