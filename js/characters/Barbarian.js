import Bree from './Bree.js';
import { openMenu, MenuScene } from '../scenes/MenuScene.js';

export default class Barbarian extends Bree {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.className = 'Barbarian';
    this.hp = 100;
    this.maxHp = 100;
    this.attackPower = 20;
  }

  attack(target) {
    console.log('Barbarian attacks!');
    target.takeDamage(this.attackPower); // Deal damage to the target
  }

  enterCombat(target) {
    openMenu(this.scene, {
      prompt: "You must attack all enemies in the area. Choose your attack!",
      options: {
        "Attack": () => this.attack(target),
        "Flee": () => this.fleeCombat()
      },
      callback: (selectedAction) => {
        selectedAction();
      }
    });
  }

  fleeCombat() {
    console.log('Barbarian flees the combat!');
    // Add logic to exit the combat scene or reset the encounter
  }
}
