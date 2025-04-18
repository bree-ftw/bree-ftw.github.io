// src/scenes/BossScene.js
import Player from '../characters/Player.js';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BossScene' });
  }

  init(data) {
    this.playerType = data.player.classType;
    this.onVictory = data.onVictory || (() => this.scene.start('StoryScene'));
    this.onDefeat = data.onDefeat || (() => this.scene.start('GameOverScene'));
    this.triviaData = data.triviaData || [];
    this.isPaused = false;
    this.levelKey = "boss";
  }

  preload() {
    this.load.image('fuzzy', 'assets/images/fuzzy.png');
    this.load.image('projectile', 'assets/images/rubberBall.png');
    this.load.json('trivia', 'assets/data/trivia.json');
    this.load.image('breebo', 'assets/images/breebo.png');
    this.load.image('barbarian', 'assets/images/barbarian.png');
    this.load.image('bard', 'assets/images/bard.png');
    this.load.image('wizard', 'assets/images/wizard.png');
  }

  create() {
    // Set up player
    this.player = new Player(this, this.scale.width / 2, this.scale.height - 100);
    this.player.setType(this.playerType);
    this.player.scene = this;
    this.player.die = () => this.onDefeat();

    this.triviaData = this.cache.json.get('trivia');

    // Set up fuzzy boss
    this.fuzzy = this.physics.add.sprite(this.scale.width / 2, 150, 'fuzzy')
      .setDisplaySize(120, 120)
      .setImmovable(true);

    this.fuzzy.hp = 400;
    this.fuzzy.healthText = this.add.text(this.fuzzy.x, this.fuzzy.y - 70, 'HP: 400', {
      fontSize: '18px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.fuzzy.takeDamage = (amount) => {
      this.fuzzy.hp -= amount;
      this.fuzzy.healthText.setText(`HP: ${this.fuzzy.hp}`);
      if (this.fuzzy.hp <= 0) {
        this.onVictory();
        this.fuzzy.destroy();
        this.fuzzy.healthText.destroy();
      }
    };

    // Projectiles
    this.projectiles = this.physics.add.group();
    this.projectileTimer = this.time.addEvent({
      delay: 750,
      callback: this.shootProjectile,
      callbackScope: this,
      loop: true
    });

    function handleProjectilePlayerOverlap(player, projectile) {
        projectile.destroy();
        this.player.takeDamage(20);
      }
      
      this.physics.add.overlap(this.player, this.projectiles, handleProjectilePlayerOverlap, null, this);
      

    // Treat fuzzy as the only enemy for combat
    this.enemies = [this.fuzzy];

    this.player.create?.();

    this.player.enterCombat(this.triviaData);
  }

  update(time, delta) {
    if (this.isPaused) return;
    this.fuzzy.healthText.setPosition(this.fuzzy.x, this.fuzzy.y - 70);

    this.projectiles.children.each(p => {
      if (p.y > this.scale.height || p.y < 0 || p.x < 0 || p.x > this.scale.width) {
        p.destroy();
      }
    });

    this.player.update?.(time, delta);
  }

  shootProjectile() {
    const proj = this.projectiles.create(this.fuzzy.x, this.fuzzy.y, 'projectile').setDisplaySize(30, 30);
    this.physics.moveToObject(proj, this.player, 600);
  }
}
