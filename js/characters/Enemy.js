// src/characters/Enemy.js

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, attack, hp, texture, spd) {
    super(scene, x, y, texture);
    this.hp = hp;
    this.attackPower = attack;
    this.spd=spd
  }
}
