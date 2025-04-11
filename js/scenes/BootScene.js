// js/scenes/BootScene.js
export default class BootScene extends Phaser.Scene {
    constructor() {
      super('BootScene');
    }
  
    preload() {
      // --- LOAD ASSETS HERE ---
      // Example images
      this.load.image('bree', 'assets/images/bree.png');
      this.load.image('background', 'assets/images/bg.png');
      this.load.image('button', 'assets/images/button.png');
  
      // Example audio
      this.load.audio('bark', 'assets/audio/bark.wav');
      this.load.audio('theme', 'assets/audio/title-theme.mp3');
  
      // Load a loading bar (optional)
      this.load.on('progress', (value) => {
        console.log(`Loading progress: ${Math.floor(value * 100)}%`);
      });
    }
  
    create() {
      console.log('Boot complete. Starting MenuScene...');
      this.scene.launch('MenuScene', {
        prompt: 'Choose Bree\'s class:',
        options: {
          Barbarian: 'Combat is required, high power melee attack',
          Wizard: 'More peaceful, but has one highly effective spell per combat',
          Bard: 'Most peaceful, uses music to charm attackers'
        },
        callback: (choice) => {
          console.log('Selected:', choice);
          // Save to registry/data manager:
          this.registry.set('playerClass', choice);
          this.scene.start('TutorialScene');
        }
      });
    }
  }
  