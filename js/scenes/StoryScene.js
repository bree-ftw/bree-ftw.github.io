export default class StoryScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StoryScene' });
    }
  
    init(data) {
      this.storyText = data.text || [];
      this.onComplete = data.onComplete || (() => {});
      this.currentIndex = 0;
      this.displayedItem = null;
    }
  
    preload() {
      // Preload any images in the story text
      this.storyText.forEach(entry => {
        if (typeof entry === 'string' && entry.startsWith('img:')) {
          const imgKey = entry.split(':')[1];
          if (!this.textures.exists(imgKey)) {
            this.load.image(imgKey, `assets/images/${imgKey}`);
          }
        }
      });
    }
  
    create() {
      this.input.once('pointerdown', this.advanceStory, this);
  
      this.showCurrentEntry();
    }
  
    showCurrentEntry() {
      const entry = this.storyText[this.currentIndex];
      if (!entry) {
        this.onComplete();
        return;
      }
  
      if (this.displayedItem) this.displayedItem.destroy();
  
      if (entry.startsWith('img:')) {
        const imgKey = entry.split(':')[1];
        this.displayedItem = this.add.image(this.scale.width / 2, this.scale.height / 2, imgKey)
          .setAlpha(0)
          .setOrigin(0.5)
          this.displayedItem.displayWidth = 200;       // Set the width to 200 pixels
          this.displayedItem.scaleY = this.displayedItem.scaleX;
      } else {
        this.displayedItem = this.add.text(this.scale.width / 2, this.scale.height / 2, entry, {
          fontSize: '28px',
          color: '#ffffff',
          wordWrap: { width: this.scale.width - 100 },
          align: 'center',
        }).setOrigin(0.5).setAlpha(0);
      }
  
      this.tweens.add({
        targets: this.displayedItem,
        alpha: 1,
        duration: 500
      });
    }
  
    advanceStory() {
      this.currentIndex++;
  
      if (this.currentIndex >= this.storyText.length) {
        this.onComplete();
      } else {
        this.showCurrentEntry();
        this.input.once('pointerdown', this.advanceStory, this);
      }
    }
  }
  