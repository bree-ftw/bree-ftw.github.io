export default class Enemy {
    constructor(scene, x, y, hp) {
      this.scene = scene;
      this.x = x;
      this.y = y;
      this.hp = hp;
      this.maxHp = hp;
    }
  
    takeDamage(amount) {
      this.hp -= amount;
      if (this.hp <= 0) {
        this.die();
      }
    }
  
    die() {
      console.log('The enemy has been defeated!');
      // Add logic to handle enemy death (e.g., remove from scene, drop items, etc.)
    }
  }
  