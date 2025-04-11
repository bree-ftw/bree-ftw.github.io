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
  }

  create() {
    this.score = 0;
    this.notes = [];
    this.isPlaying = true;

    const rhythmData = this.cache.json.get('rhythms').rhythms;

    const screenCenterX = this.scale.width / 2;
    const columnWidth = 100;

    // Define columns centered on screen
    this.columns = {
      A: screenCenterX - 1.5 * columnWidth,
      S: screenCenterX - 0.5 * columnWidth,
      D: screenCenterX + 0.5 * columnWidth,
      F: screenCenterX + 1.5 * columnWidth,
    };

    // Draw columns visually
    Object.values(this.columns).forEach(x => {
      this.add.rectangle(x, this.scale.height / 2, 80, this.scale.height, 0x444444, 0.2).setOrigin(0.5);
    });

    // Target hit zone
    this.hitY = this.scale.height - 100;
    this.add.rectangle(screenCenterX, this.hitY, 400, 10, 0xffffff).setOrigin(0.5);

    // Feedback text
    this.feedbackText = this.add.text(screenCenterX, this.hitY - 40, '', {
      fontSize: '32px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Score
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#fff'
    });

    // Define colors for each note (A, S, D, F)
    const noteColors = {
      A: 0xff0000, // Red
      S: 0x00ff00, // Green
      D: 0x0000ff, // Blue
      F: 0xffff00  // Yellow
    };

    // Generate notes
    rhythmData.forEach(data => {
      const x = this.columns[data.note];
      const y = 0;

      // Create the note as a colored rectangle
      const note = this.add.rectangle(x, y, 60, 40, noteColors[data.note]).setOrigin(0.5);
      note.noteKey = data.note;
      note.hit = false;
      note.isFalling = true;

      // Add falling animation with correct timing
      this.tweens.add({
        targets: note,
        y: this.hitY,
        duration: 2000,
        delay: data.time,
        ease: 'Linear',
        onUpdate: () => {
          // The note is still falling
          note.isFalling = true;
        },
        onComplete: () => {
          // The note has completed falling, mark it as inactive
          note.isFalling = false;
        }
      });

      this.notes.push(note);
    });

    // Input listeners for A, S, D, F
    ['A', 'S', 'D', 'F'].forEach(key => {
      this.input.keyboard.on(`keydown-${key}`, () => this.checkInput(key));
    });
  }

  checkInput(key) {
    const columnX = this.columns[key];
    const tolerance = 100;
    let hit = false;

    // Check if any note is falling and is near the hit zone
    for (const note of this.notes) {
      if (!note.isFalling || note.hit) continue;

      if (note.noteKey === key && Math.abs(note.y - this.hitY) < tolerance) {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        note.hit = true;
        note.destroy();
        this.showFeedback('Hit!', '#0f0');
        hit = true;
        break;
      }
    }

    if (!hit) {
      this.showFeedback('Miss!', '#f00');
    }
  }

  showFeedback(text, color) {
    this.feedbackText.setText(text).setColor(color);
    this.time.delayedCall(500, () => {
      this.feedbackText.setText('');
    });
  }

  update() {
    // Clean up any notes that are outside the screen and haven't been hit
    this.notes = this.notes.filter(note => {
      if (!note.active) {
        return false; // Remove inactive notes
      }

      // If note is past the bottom of the screen and hasn't been hit, it's a miss
      if (note.y > this.scale.height) {
        note.destroy();
        return false;
      }

      return true;
    });

    // If all notes are hit or destroyed, complete the game
    if (this.notes.every(note => note.hit || !note.isFalling) && this.isPlaying) {
      this.isPlaying = false;
      this.showScore();
    }
  }

  showScore() {
    // Display score and the "Back to Combat" button
    const screenCenterX = this.scale.width / 2;
    const screenCenterY = this.scale.height / 2;

    const scoreText = this.add.text(screenCenterX, screenCenterY - 50, `Your Score: ${this.score}`, {
      fontSize: '40px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Add "Back to Combat" button
    const button = this.add.text(screenCenterX, screenCenterY + 50, 'Back to Combat', {
      fontSize: '32px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive();

    button.on('pointerdown', () => {
      // Transition back to the CombatScene (you can customize this as needed)
      this.scene.start('CombatScene', { player: this.player });
    });
  }
}
