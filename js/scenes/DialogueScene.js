export default class DialogueScene extends Phaser.Scene {
    constructor() {
      super({ key: 'DialogueScene' });
    }
  
    init(data) {
      this.dialogue = data.dialogue;
      this.onComplete = data.onComplete || (() => {});
      this.dialogueIndex = 0;
      this.messageLog = [];
    }
  
    preload() {
      // Load character image if not already loaded
      if (this.dialogue.with && !this.textures.exists(this.dialogue.with)) {
        this.load.image(this.dialogue.with, `assets/images/${this.dialogue.with}`);
      }
      this.load.image("breebo.png", "assets/images/breebo.png")
    }
  
    create() {
      this.cameras.main.setBackgroundColor('#000');
  
      // Load portraits (you = breebo.png on right, with = left)
      this.youPortrait = this.add.image(this.scale.width - 100, this.scale.height - 100, 'breebo.png').setScale(0.5).setAlpha(0.5);
      this.withPortrait = this.add.image(100, this.scale.height - 100, this.dialogue.with).setScale(0.5).setAlpha(0.5);
  
      // Input to advance
      this.input.keyboard.once('keydown', this.advanceDialogue, this);
      this.input.once('pointerdown', this.advanceDialogue, this);
  
      this.showNextMessage();
    }
  
    showNextMessage() {
      const current = this.dialogue.text[this.dialogueIndex];
      if (!current) {
        this.time.delayedCall(500, this.onComplete); // small delay for smooth exit
        return;
      }
  
      const speaker = Object.keys(current)[0];
      const message = current[speaker];
  
      const isYou = speaker === 'you';
  
      const x = isYou ? this.scale.width - 150 : 150;
      const align = isYou ? 'right' : 'left';
      const color = isYou ? '#aaffaa' : '#aaaaff';
  
      const textObj = this.add.text(x, this.scale.height - 100, message, {
        fontSize: '20px',
        color,
        wordWrap: { width: this.scale.width * 0.6 },
        align,
      }).setOrigin(isYou ? 1 : 0, 1);
  
      this.messageLog.push(textObj);
  
      // Shift previous messages upward
      this.messageLog.forEach(msg => {
        msg.y -= 50;
        if (msg.y < 0) {
          msg.destroy();
        }
      });
  
      // Filter out destroyed messages
      this.messageLog = this.messageLog.filter(msg => msg.active);
  
      // Setup next input
      this.dialogueIndex++;
      this.input.keyboard.once('keydown', this.advanceDialogue, this);
      this.input.once('pointerdown', this.advanceDialogue, this);
    }
  
    advanceDialogue() {
      this.showNextMessage();
    }
  }
  