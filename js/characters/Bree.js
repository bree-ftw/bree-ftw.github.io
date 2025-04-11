// js/characters/Bree.js

export default class Bree extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture = 'bree') {
      super(scene, x, y, texture);
  
      scene.add.existing(this);
      scene.physics.add.existing(this);
  
      this.setScale(1.5);
      this.setOrigin(0.5);
  
      this.hp = 100;       // default HP
      this.maxHp = 100;
      this.className = 'Dog';
  
      this.scene = scene;
    }
  
    takeDamage(amount) {
      this.hp = Math.max(0, this.hp - amount);
      if (this.hp === 0) {
        this.die();
      }
    }
  
    heal(amount) {
      this.hp = Math.min(this.maxHp, this.hp + amount);
    }
  
    die() {
      console.log(`${this.className} has fallen.`);
      this.destroy(); // remove sprite
      // Could trigger scene restart or game over
    }
  }
  