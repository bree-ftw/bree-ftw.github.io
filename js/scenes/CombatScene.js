// src/scenes/CombatScene.js
import Enemy from '../characters/Enemy.js';
import Player from '../characters/Player.js';

export default class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data) {
    this.playerType = data.player.classType

    this.levelKey = data.levelKey;
    this.onVictory = data.onVictory || (() => this.scene.start('StoryScene'));
    this.onDefeat = data.onDefeat || (() => this.scene.start('GameOverScene'));

    this.triviaData = data.triviaData || [];
  }

  preload() {
    this.load.json('enemies', 'assets/data/enemies.json');
  this.load.json('trivia', 'assets/data/trivia.json');
    this.load.image('rubberBall', 'assets/images/rubberBall.png');
    this.load.image('snake', 'assets/images/snake.png');
    this.load.image('squirrel', 'assets/images/squirrel.png');
    this.load.image('tiger', 'assets/images/tiger.png');
    this.load.image('fuzzy', 'assets/images/fuzzy.png');
    this.load.image('breebo', 'assets/images/breebo.png');
    this.load.image('barbarian', 'assets/images/barbarian.png');
    this.load.image('bard', 'assets/images/bard.png');
    this.load.image('wizard', 'assets/images/wizard.png');
  }

  create() {

    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);

    this.player.setType(this.playerType);

    const allTrivia = this.cache.json.get('trivia');
    this.triviaData = allTrivia || [];

    const enemyData = this.cache.json.get('enemies')[this.levelKey];
    console.log(this.levelKey, enemyData)
    const ts = Object.keys(enemyData)
    this.enemies = [];
    this.activeEnemies = [];
    ts.forEach(k => {
      const config = enemyData[k];
  
      for (let i = 0; i < config.n; i++) {
        const { x, y } = this.getRandomEdgePosition();
        const enemy = new Enemy(this, x, y, config.att, config.hp, k, config.spd);
        enemy.attackCooldown = 0;
  
        this.add.existing(enemy).setDisplaySize(config.size[0], config.size[1]);
        this.physics.add.existing(enemy);
        enemy.setCollideWorldBounds(true);
  
        enemy.healthText = this.add.text(enemy.x, enemy.y - 30, enemy.hp, {
          fontSize: '14px',
          fill: '#fff',
          stroke: '#000',
          strokeThickness: 3
        }).setOrigin(0.5);
  
        enemy.die = () => {
          enemy.healthText.destroy();
          enemy.destroy();
          this.activeEnemies = this.activeEnemies.filter(e => e !== enemy);
          this.enemies = this.enemies.filter(e => e !== enemy);
          if (this.enemies.length === 0 && this.activeEnemies.length === 0) {
            this.onVictory();
          }
        };
  
        enemy.takeDamage = (amount) => {
          enemy.hp -= amount;
          enemy.healthText.setText(enemy.hp);
          if (enemy.hp <= 0) {
            enemy.die();
          }
        };
  
        enemy.attack = (time) => {
          if (
            time > enemy.attackCooldown &&
            Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 50
          ) {
            this.player.takeDamage?.(enemy.attackPower);
            enemy.attackCooldown = time + 1000;
          }
        };
  
        this.enemies.push(enemy);
      }
    })

    this.player.enemies = this.enemies;
    this.player.scene = this;

    this.player.create?.();
    this.player.enterCombat(this.triviaData);

    this.lastAdvanceTime = 0;
    this.isPaused = false;
  }

  update(time, delta) {
    if (this.isPaused) return;

    // Activate up to 5 enemies at a time
    if (this.activeEnemies.length < 5 && time > this.lastAdvanceTime + 500) {
      const next = this.enemies.find(e => !this.activeEnemies.includes(e));
      if (next) {
        this.activeEnemies.push(next);
        this.lastAdvanceTime = time;
      }
    }

    this.activeEnemies.forEach(enemy => {
      if (enemy.active && this.player.active) {
        this.physics.moveToObject(enemy, this.player, enemy.spd);
        enemy.attack(time);
        enemy.healthText.setPosition(enemy.x, enemy.y - 30);
      }
    });

    this.player.update?.(time, delta);
  }

  getRandomEdgePosition() {
    const width = this.scale.width;
    const height = this.scale.height;
    const edge = Phaser.Math.Between(0, 3);

    switch (edge) {
      case 0: return { x: Phaser.Math.Between(0, width), y: 0 };            // Top
      case 1: return { x: width, y: Phaser.Math.Between(0, height) };       // Right
      case 2: return { x: Phaser.Math.Between(0, width), y: height };       // Bottom
      case 3: return { x: 0, y: Phaser.Math.Between(0, height) };           // Left
    }
  }
}
