// src/scenes/StoryScene.js

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
  }

  init(data) {
    this.text = data.text || '';
    this.onComplete = data.onComplete || (() => {});
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor('#000');

    // Create the scrolling story text
    const storyText = this.add.text(width / 2, height + 100, this.text, {
      fontSize: '28px',
      color: '#ffffff',
      wordWrap: { width: width - 100 },
      align: 'center'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: storyText,
      y: height / 2,
      duration: 3000,
      ease: 'Sine.easeOut'
    });

    // Continue instructions
    this.add.text(width / 2, height - 50, 'Click or press any key to continue...', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.handleComplete());
    this.input.keyboard.once('keydown', () => this.handleComplete());
  }

  handleComplete() {
    this.scene.stop('StoryScene')
    if (this.onComplete) {
      this.onComplete();
    }
  }
}
