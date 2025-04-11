import Phaser from 'phaser';

export default class RhythmGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RhythmGameScene' });
  }

  init(data) {
    this.onComplete = data.onComplete;
  }

  preload() {
    this.load.json('rhythms', 'assets/data/rhythm.json');
  }

  create() {
    this.score = 0;
    this.notes = [];
    this.isPlaying = true;

    const rhythmData = this.cache.json.get('rhythms').rhythms;

    this.columns = {
      A: 100,
      S: 200,
      D: 300,
      F: 400
    };

    // Draw hit line
    this.hitLineY = 600;
    this.add.line(0, 0, 50, this.hitLineY, 500, this.hitLineY, 0xffffff, 0.5)
      .setLineWidth(2, 2);

    rhythmData.forEach(data => {
      const x = this.columns[data.note];
      const note = this.add.rectangle(x, 0, 40, 40, 0x88ccff);
      note.noteType = data.note;

      this.tweens.add({
        targets: note,
        y: this.hitLineY,
        duration: 2000,
        delay: data.time,
        ease: 'Linear',
        onComplete: () => {
          if (note.active) {
            note.destroy(); // missed note
          }
        }
      });

      this.notes.push(note);
    });

    this.input.keyboard.on('keydown-A', () => this.checkInput('A'));
    this.input.keyboard.on('keydown-S', () => this.checkInput('S'));
    this.input.keyboard.on('keydown-D', () => this.checkInput('D'));
    this.input.keyboard.on('keydown-F', () => this.checkInput('F'));
  }

  checkInput(noteKey) {
    const columnX = this.columns[noteKey];

    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      if (note.active && note.noteType === noteKey && Math.abs(note.y - this.hitLineY) < 30) {
        this.score += 10;
        note.destroy();
        break;
      }
    }
  }

  update() {
    if (this.notes.every(n => !n.active) && this.isPlaying) {
      this.isPlaying = false;
      this.time.delayedCall(500, () => {
        this.onComplete?.(this.score);
        this.scene.stop();
      });
    }
  }
}
