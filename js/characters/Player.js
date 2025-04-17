// src/characters/Player.js

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'breebo') {
    super(scene, x, y, texture);

    scene.add.existing(this).setDisplaySize(60,95);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    // Default stats
    this.classType = "Dog";
    this.hp = 100;
    this.maxHp = 100;
    this.attackPower = 25;
    this.canAttack = true;
  }

  setType(type) {
    this.classType = type;

    switch (type) {
      case "Barbarian":
        this.hp = 150;
        this.maxHp = 200;
        this.attackPower = 50;
        this.setTexture('barbarian');
        this.classType = "Barbarian";
        break;
      case "Bard":
        this.hp = 100;
        this.maxHp = 100;
        this.attackPower = 0;
        this.setTexture('bard');
        this.classType = "Bard";
        break;
      case "Wizard":
        this.hp = 75;
        this.maxHp = 75;
        this.attackPower = 10;
        this.triviaActive=false;
        this.currentQuestion=0
        this.setTexture('wizard');
        this.classType = "Wizard";
        break;
      default:
        break;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die?.();
    }
  }

  enterCombat(triviaData = null) {
    console.log("enter combat", this.classType)
    switch (this.classType) {
      case 'Barbarian':
        this.enableBarbarianCombat();
        break;
      case 'Wizard':
        this.enableWizardCombat(triviaData);
        break;
      case 'Bard':
        this.enableBardCombat();
        break;
    }
  }
  enableBarbarianCombat() {
    this.scene.input.keyboard.on('keydown-W', () => this.setVelocityY(-100));
    this.scene.input.keyboard.on('keydown-S', () => this.setVelocityY(100));
    this.scene.input.keyboard.on('keydown-A', () => this.setVelocityX(-100));
    this.scene.input.keyboard.on('keydown-D', () => this.setVelocityX(100));
  
    this.scene.input.keyboard.on('keyup-W', () => this.setVelocityY(0));
    this.scene.input.keyboard.on('keyup-S', () => this.setVelocityY(0));
    this.scene.input.keyboard.on('keyup-A', () => this.setVelocityX(0));
    this.scene.input.keyboard.on('keyup-D', () => this.setVelocityX(0));
  
    this.scene.input.on('pointerdown', pointer => {
        console
      if (!this.canAttack) return;
  
      const clickedEnemy = this.scene.enemies.find(e => e.getBounds().contains(pointer.x, pointer.y));

    if (clickedEnemy &&
        Phaser.Math.Distance.Between(this.x, this.y, clickedEnemy.x, clickedEnemy.y) < 200) {
      clickedEnemy.takeDamage(this.attackPower);
      this.canAttack = false;
      this.scene.time.delayedCall(500, () => this.canAttack = true);
    }
    });
  }
  enableWizardCombat(triviaData) {

    this.scene.input.keyboard.on('keydown-W', () => this.setVelocityY(-100));
    this.scene.input.keyboard.on('keydown-S', () => this.setVelocityY(100));
    this.scene.input.keyboard.on('keydown-A', () => this.setVelocityX(-100));
    this.scene.input.keyboard.on('keydown-D', () => this.setVelocityX(100));
  
    this.scene.input.keyboard.on('keyup-W', () => this.setVelocityY(0));
    this.scene.input.keyboard.on('keyup-S', () => this.setVelocityY(0));
    this.scene.input.keyboard.on('keyup-A', () => this.setVelocityX(0));
    this.scene.input.keyboard.on('keyup-D', () => this.setVelocityX(0));
    this.hasTriviaPower = false;
  
    this.scene.input.keyboard.on('keydown-E', () => {
        if (this.triviaActive || !triviaData || triviaData.length === 0) return;
        const currentQuestion = Math.floor(Math.random() * triviaData.length);
        const trivia = triviaData[currentQuestion];
        if (!trivia) return; // avoid accessing undefined question
      
        console.log(currentQuestion, trivia, triviaData);
        const allAnswers = this.shuffleAnswers([trivia.correctAnswer, ...trivia.wrongAnswers]);

        const options = {};
        allAnswers.forEach((answer, index) => {
            options[answer] = null;
        });
        console.log("asking", this.scene.textures.getTextureKeys())

        this.scene.scene.launch('MenuScene', {
            prompt: trivia.question,
            options: options,
            callback: (selectedAnswer) => {
                setTimeout(() => {
                    this.scene.scene.stop('MenuScene');
                    console.log(this.scene.textures.getTextureKeys());
              
                    this.triviaActive = false;
                    if (selectedAnswer === trivia.correctAnswer) {
                      console.log('Correct! You cast your spell.');
                      this.hasTriviaPower = true;
                      console.log("cq", currentQuestion);
                    } else {
                      console.log('Wrong answer!');
                    }
                  }, 10);
            }
        });
    });
  
    this.scene.input.on('pointerdown', pointer => {
        if (this.hasTriviaPower) {
            const nearbyEnemies = this.scene.enemies.filter(e =>
                Phaser.Math.Distance.Between(pointer.x, pointer.y, e.x, e.y) < 300
              );
              if (nearbyEnemies.length > 0) {
                nearbyEnemies.forEach(e => e.takeDamage(150));
                this.hasTriviaPower = false; // clear after use
              }           
              console.log("Spell cast on", nearbyEnemies.length, "enemies", this.scene.enemies);
        } else {
            if (!this.canAttack) return;
            const clickedEnemy = this.scene.enemies.find(e => e.getBounds().contains(pointer.x, pointer.y));

    if (clickedEnemy &&
        Phaser.Math.Distance.Between(this.x, this.y, clickedEnemy.x, clickedEnemy.y) < 200) {
      clickedEnemy.takeDamage(this.attackPower);
      this.canAttack = false;
      this.scene.time.delayedCall(1000, () => this.canAttack = true);
    }
        }
    });
  }

  enableBardCombat() {
    this.setVelocity(0, 0); // stays stationary
  
    this.scene.input.keyboard.on('keydown-E', () => {
      if (this.rhythmStarted) return;
  
      this.rhythmStarted = true;
  
      // Pause enemy movement
      this.scene.physics.world.isPaused = true;
      this.scene.isPaused = true;
  
      this.scene.scene.launch('RhythmGameScene', {
        onComplete: (score) => {
          this.scene.physics.world.isPaused = false;
          this.scene.isPaused = false;
          this.rhythmStarted = false;

          this.scene.scene.stop('RhythmGameScene');
          this.scene.enemies.sort((a, b) => {
            const distA = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
            const distB = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y);
            return distA - distB;
          });
          console.log(score)
            var remainingDmg = score;
            this.scene.enemies.forEach(e => {
                console.log(e.hp)
                if (remainingDmg==0) return;
                const allocatedDmg = Math.min(remainingDmg,e.hp);
                console.log(remainingDmg)
                remainingDmg -= allocatedDmg;
                e.takeDamage(allocatedDmg);
                console.log("dealing", e, allocatedDmg, remainingDmg)
            }); 
        }
      });
    });
  }      
  shuffleAnswers(answers) {
    // Shuffle the answers array to randomize the order
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]]; // Swap elements
    }
    return answers;
  }
}
