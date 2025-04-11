class RhythmGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RhythmGameScene' });
  }

  preload() {
    this.load.json('rhythms', 'assets/data/rhythm.json');
  }

  create() {
    const data = this.cache.json.get('rhythms');
    this.notes = [];
    this.columns = { A: 100, S: 200, D: 300, F: 400 };
    this.score = 0;

    this.add.line(0, 0, 50, 600, 500, 600, 0xffffff, 0.5).setLineWidth(2, 2);

    data.rhythms.forEach(noteData => {
      const x = this.columns[noteData.note];
      const note = this.add.rectangle(x, 0, 40, 40, 0x88ccff);
      note.noteType = noteData.note;

      this.tweens.add({
        targets: note,
        y: 600,
        duration: 2000,
        delay: noteData.time,
        ease: 'Linear',
        onComplete: () => {
          if (note.active) note.destroy();
        }
      });

      this.notes.push(note);
    });

    this.input.keyboard.on('keydown-A', () => this.hitNote('A'));
    this.input.keyboard.on('keydown-S', () => this.hitNote('S'));
    this.input.keyboard.on('keydown-D', () => this.hitNote('D'));
    this.input.keyboard.on('keydown-F', () => this.hitNote('F'));
  }

  hitNote(key) {
    const lineY = 600;
    for (const note of this.notes) {
      if (note.active && note.noteType === key && Math.abs(note.y - lineY) < 30) {
        this.score += 10;
        note.destroy();
        break;
      }
    }
  }

  update() {
    if (this.notes.every(n => !n.active)) {
      console.log('Done! Score:', this.score);
    }
  }
}
