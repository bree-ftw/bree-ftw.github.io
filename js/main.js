import Phaser from 'phaser';
import RhythmGameScene from './scenes/RhythmGameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 700,
  backgroundColor: '#222',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [RhythmGameScene]
};

const game = new Phaser.Game(config);

game.scene.start('RhythmGameScene', {
  onComplete: (score) => {
    console.log(`Rhythm game finished! Score: ${score}`);
  }
});
