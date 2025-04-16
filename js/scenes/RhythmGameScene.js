// src/scenes/RhythmGameScene.js

export default class RhythmGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RhythmGameScene' });
  }

  init(data) {
    this.onComplete = data.onComplete || (() => {});
  }

  preload() {
    this.load.json('rhythms', 'assets/data/rhythm.json');

    // Preload arrow sprites (replace these with your actual filenames)
    this.load.image('arrowLeft', 'assets/images/left.png');
    this.load.image('arrowUp', 'assets/images/up.png');
    this.load.image('arrowDown', 'assets/images/down.png');
    this.load.image('arrowRight', 'assets/images/right.png');
  }

  create() {
    this.score = 0;
    this.notes = [];
    this.isPlaying = true;

    const rhythmData = this.cache.json.get('rhythms').rhythms;

    const screenCenterX = this.scale.width / 2;
    const columnWidth = 100;

    this.columns = {
      A: screenCenterX - 1.5 * columnWidth,
      W: screenCenterX - 0.5 * columnWidth,
      S: screenCenterX + 0.5 * columnWidth,
      D: screenCenterX + 1.5 * columnWidth,
    };

    Object.values(this.columns).forEach(x => {
      this.add.rectangle(x, this.scale.height / 2, 80, this.scale.height, 0x444444, 0.2).setOrigin(0.5);
    });

    this.hitY = this.scale.height - 100;
    this.add.rectangle(screenCenterX, this.hitY, 400, 10, 0xffffff).setOrigin(0.5);

    this.feedbackText = this.add.text(screenCenterX, this.hitY - 40, '', {
      fontSize: '32px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const arrowSprites = {
      A: 'arrowLeft',
      W: 'arrowUp',
      S: 'arrowDown',
      D: 'arrowRight'
    };

    rhythmData.forEach(data => {
      const x = this.columns[data.note];
      const y = 0;

      const note = this.add.rectangle(x, y, 60, 40, 0x000000).setOrigin(0.5).setAlpha(0);
      const arrow = this.add.image(x, y, arrowSprites[data.note]).setDisplaySize(60, 60).setOrigin(0.5);

      note.noteKey = data.note;
      note.arrow = arrow;
      note.hit = false;
      note.isFalling = true;

      this.tweens.add({
        targets: [note, arrow],
        y: this.hitY,
        duration: 2000,
        delay: data.time,
        ease: 'Linear',
        onUpdate: () => {
          note.isFalling = true;
        },
        onComplete: () => {
          note.isFalling = false;
        }
      });

      this.notes.push(note);
    });

    const keyMap = {
      'UP': 'W',
      'DOWN': 'S',
      'LEFT': 'A',
      'RIGHT': 'D'
    };
    
    ['A', 'W', 'S', 'D'].forEach(key => {
      this.input.keyboard.on(`keydown-${key}`, () => this.checkInput(key));
    });
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(key => {
      this.input.keyboard.on(`keydown-${key}`, () => this.checkInput(keyMap[key]));
    });    
  }

  checkInput(key) {
    const tolerance = 100;
    let hit = false;

    for (const note of this.notes) {
      if (!note.isFalling || note.hit) continue;

      if (note.noteKey === key && Math.abs(note.y - this.hitY) < tolerance) {
        this.score += 10;
        note.hit = true;
        note.destroy();
        note.arrow.destroy();
        this.showFeedback('Hit!', '#0f0');
        hit = true;
        break;
      }
    }

    if (!hit) {
      this.showFeedback('Miss!', '#f00');
      this.score -= 10;
    }
  }

  showFeedback(text, color) {
    this.feedbackText.setText(text).setColor(color);
    this.time.delayedCall(500, () => {
      this.feedbackText.setText('');
    });
  }

  update() {
    this.notes = this.notes.filter(note => {
      if (!note.active) return false;

      if (note.y > this.scale.height) {
        note.destroy();
        note.arrow.destroy();
        return false;
      }

      note.arrow.y = note.y;
      return true;
    });

    if (this.notes.every(note => note.hit || !note.isFalling) && this.isPlaying) {
      this.isPlaying = false;
      this.showScore();
    }
  }

  showScore() {
    const screenCenterX = this.scale.width / 2;
    const screenCenterY = this.scale.height / 2;

    this.add.text(screenCenterX, screenCenterY - 50, `Your Score: ${this.score}`, {
      fontSize: '40px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const button = this.add.text(screenCenterX, screenCenterY + 50, 'Back to Combat', {
      fontSize: '32px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive();

    button.on('pointerdown', () => {
      this.onComplete(this.score);
    });
  }
}
