export default class RhythmGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RhythmGameScene' });
  }

  init(data) {
    this.onComplete = data.onComplete || (() => {});
    this.hits=0;
    this.misses=0;
  }

  preload() {
    this.load.json('rhythms', 'assets/data/rhythm.json');
    this.load.image('arrowLeft', 'assets/images/left.png');
    this.load.image('arrowUp', 'assets/images/up.png');
    this.load.image('arrowDown', 'assets/images/down.png');
    this.load.image('arrowRight', 'assets/images/right.png');
    this.load.audio('op19no6', 'assets/audio/op19no6.mp3');
  }

  create() {
    this.score = 0;
    this.notes = [];
    this.misses = 0;
    this.isPlaying = true;
    this.music = this.sound.add('op19no6');
    console.log("startedr")

    const rhythmData = this.cache.json.get('rhythms')["3"];

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
      const note = this.add.rectangle(x, 0, 60, 40, 0x000000).setOrigin(0.5).setAlpha(0);
      const arrow = this.add.image(x, 0, arrowSprites[data.note]).setDisplaySize(60, 60).setOrigin(0.5);
      note.noteKey = data.note;
      note.arrow = arrow;
      note.hit = false;
      note.time = data.time; // The spawn time
      note.fallDuration = 2000; // How long the note will take to fall to the bottom (in ms)
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

    console.log("reached")

    this.music.play();
  }

  checkInput(key) {
    const tolerance = 50;
    let hit = false;

    for (const note of this.notes) {
      if (note.hit) continue;

      if (note.noteKey === key && Math.abs(note.y - this.hitY) < tolerance) {
        this.score += 10;
        this.hits++;
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
      this.misses++;
    }
  }

  showFeedback(text, color) {
    this.feedbackText.setText(text).setColor(color);
    this.time.delayedCall(500, () => {
      this.feedbackText.setText('');
    });
  }

  update() {
    const elapsed = this.music.seek * 1000; // Use audio-based clock (in ms)

    this.notes = this.notes.filter(note => {
      if (!note.active) return false;

      const timeUntilHit = note.time - elapsed; // Time remaining until the note should hit the bottom
      const progress = Math.max(0, 1 - (timeUntilHit / note.fallDuration)); // Progress of fall (from 0 to 1)
      note.y = Phaser.Math.Linear(0, this.hitY, progress);
      note.arrow.y = note.y;
      note.setAlpha(1);

      // Remove missed notes
      if (note.y > this.scale.height) {
        note.destroy();
        note.arrow.destroy();
        return false;
      }

      return true;
    });

    if (this.notes.every(note => note.hit || !note.active) && this.isPlaying) {
      this.isPlaying = false;
      this.showScore();
    }
    if (this.misses > 15 && this.isPlaying) {
      this.isPlaying = false;
      this.showScore();
    }
  }

  showScore() {
    this.music.stop();
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
      this.onComplete(this.score,this.hits,this.misses);
    });
  }
}
