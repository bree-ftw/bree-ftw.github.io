// src/scenes/CombatScene.js
import Phaser from 'phaser';
import Enemy from '../characters/Enemy.js';

export default class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data) {
    this.player = data.player; // Instance of Barbarian, Wizard, or Bard
  }

  preload() {
    // Load any needed assets here (e.g., sprites, sounds)
    if (this.player.preload) {
      this.player.preload();
    }
  }

  create() {
    // Spawn an enemy (you could expand to random enemy types)
    this.enemy = new Enemy(this, 400, 300, 50);

    // Let the player enter combat with the enemy
    if (this.player.create) {
      this.player.create();
    }
    this.player.enterCombat(this.enemy);
  }

  update(time, delta) {
    // Update game logic if needed
  }
}
