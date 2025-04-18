export default class StoryScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StoryScene' });
    }
  
    init(data) {
      this.storyText = data.text || [];
      this.onComplete = data.onComplete || (() => {});
      this.pt = data.pt || "";
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
          .setOrigin(0.5)
          this.displayedItem.displayWidth = 500;       // Set the width to 200 pixels
          this.displayedItem.scaleY = this.displayedItem.scaleX;
      } else {
        const weaponsDict = {"Barbarian":"Sword","Wizard":"Wand","Bard":"Guitar"}
        const t = entry.replace('$weapon', weaponsDict[this.pt])
        this.displayedItem = this.add.text(this.scale.width / 2, this.scale.height / 2, t, {
          fontSize: '28px',
          color: '#ffffff',
          wordWrap: { width: this.scale.width - 100 },
          align: 'center',
        }).setOrigin(0.5);
      }
    }
  
    advanceStory() {
      this.currentIndex++;

      console.log(this.currentIndex, this.storyText.length)
      if (this.currentIndex >= this.storyText.length) {
        this.onComplete();
      } else {
        this.showCurrentEntry();
        this.input.once('pointerdown', this.advanceStory, this);
      }
    }
  }
  