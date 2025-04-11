import RhythmGameScene from "./scenes/RhythmGameScene";

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 700,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [RhythmGameScene]
};

const game = new Phaser.Game(config);
