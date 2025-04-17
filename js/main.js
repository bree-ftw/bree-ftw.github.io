
import GameScene from './scenes/GameScene.js';
import StoryScene from './scenes/StoryScene.js';
import MenuScene from './scenes/MenuScene.js';
import CombatScene from './scenes/CombatScene.js';
import RhythmGameScene from './scenes/RhythmGameScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import BossScene from './scenes/BossScene.js';

// Optional: add a basic BootScene if needed to preload global assets

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [
    GameScene,
    StoryScene,
    MenuScene,
    CombatScene,
    RhythmGameScene,
    DialogueScene,
    BossScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);
