// src/characters/Player.js

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, gs, texture = 'breebo') {
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
    this.healthText = this.scene.add.text(this.x, this.y - 50, `HP: ${this.hp}`, {
      fontSize: '18px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.playedRhythm = false;
    this.gs = gs;
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
        if (this.healthText) {
          this.healthText.setText(`HP: ${this.hp}`);
        }
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
        if (this.healthText) {
          this.healthText.setText(`HP: ${this.hp}`);
        }
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
    if (this.healthText) {
      this.healthText.setText(`HP: ${this.hp}`);
    }
  }
  die() {
  
    if (this.healthText) {
      this.healthText.destroy();
      this.healthText = null;
    }
    this.scene.onDefeat();
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
    this.scene.input.keyboard.on('keydown-W', () => this.setVelocityY(-200));
    this.scene.input.keyboard.on('keydown-S', () => this.setVelocityY(200));
    this.scene.input.keyboard.on('keydown-A', () => this.setVelocityX(-200));
    this.scene.input.keyboard.on('keydown-D', () => this.setVelocityX(200));
  
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

    this.scene.input.keyboard.on('keydown-W', () => this.setVelocityY(-200));
    this.scene.input.keyboard.on('keydown-S', () => this.setVelocityY(200));
    this.scene.input.keyboard.on('keydown-A', () => this.setVelocityX(-200));
    this.scene.input.keyboard.on('keydown-D', () => this.setVelocityX(200));
  
    this.scene.input.keyboard.on('keyup-W', () => this.setVelocityY(0));
    this.scene.input.keyboard.on('keyup-S', () => this.setVelocityY(0));
    this.scene.input.keyboard.on('keyup-A', () => this.setVelocityX(0));
    this.scene.input.keyboard.on('keyup-D', () => this.setVelocityX(0));
    this.hasTriviaPower = false;
    this.triviaActive = false;
  
    this.scene.input.keyboard.on('keydown-E', () => {
        this.scene.input.keyboard.on('keyup-E', () => {
          if (this.triviaActive || !triviaData || triviaData.length === 0) return;
          this.scene.physics.world.isPaused = true;
          this.scene.isPaused = true;
          this.triviaActive = true;
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
          this.gs.setVisible(false,this.scene.key)
          this.dc=this.scene.time.delayedCall(5000, () => {
            if (!this.triviaActive) return;
            this.triviaActive = false;
            this.gs.stop('MenuScene')
            this.scene.physics.world.isPaused = false;
            this.scene.isPaused = false;
            this.takeDamage(15);
            this.gs.setVisible(true,this.scene.key)
          });
          this.gs.launch('MenuScene', {
              prompt: trivia.question,
              options: options,
              callback: (selectedAnswer) => {
                  setTimeout(() => {
                      this.gs.stop('MenuScene');
                      console.log(this.scene.textures.getTextureKeys());
                
                      this.triviaActive = false;
                      if (selectedAnswer === trivia.correctAnswer) {
                        console.log('Correct! You cast your spell.');
                        this.hasTriviaPower = true;
                        console.log("cq", currentQuestion);
                      } else {
                        console.log('Wrong answer!');
                        this.takeDamage(15);
                      }
                      this.scene.physics.world.isPaused = false;
                      this.scene.isPaused = false;
                      this.dc.remove();
                      this.gs.setVisible(true,this.scene.key)
                    }, 10);
              }
          });
        });
        
    });
  
    this.scene.input.on('pointerdown', pointer => {
        if (this.hasTriviaPower) {
            const nearbyEnemies = this.scene.enemies.filter(e =>
                Phaser.Math.Distance.Between(pointer.x, pointer.y, e.x, e.y) < 100
              );
              if (nearbyEnemies.length > 0) {
                nearbyEnemies.forEach(e => e.takeDamage(100));
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
  bardMiss() {
    const hks = {"ballBattle":5,"snakeBattle":8,"revengeTigerBattle":10,"squirrelBattle":15,"boss":20}
    this.hp-=hks[this.scene.levelKey];
    console.log(this.scene.levelKey, this.hp)
    if (this.hp <= 0) {
      // Kill the player
      this.gs.stop('RhythmGameScene'); 
      this.gs.stop('CombatScene');
      this.die();
      this.gs.start('StoryScene', {
        text: ["You died."],
        onComplete: () => {
          this.gs.stop('StoryScene');
          this.gs.get('GameScene').loadStep("combatDeath");
        }
      });
      return;
    }
    return (this.hp);
  }
  shuffleAnswers(answers) {
    // Shuffle the answers array to randomize the order
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]]; // Swap elements
    }
    return answers;
  }
  enableBardCombat() {
    this.setVelocity(0, 0); // stays stationary
  
    this.scene.input.keyboard.on('keydown-E', () => {
      if (this.rhythmStarted || this.playedRhythm) return;
  
      this.rhythmStarted = true;
      this.playedRhythm = true;
  
      // Pause enemy movement
      this.scene.physics.world.isPaused = true;
      this.scene.isPaused = true;

      console.log("started")
  
      this.gs.launch('RhythmGameScene', {
        mf: () => {
          return this.bardMiss(); 
        },
        hp: this.hp,
        onComplete: (score, hits, misses) => {
          this.rhythmStarted = false;
          const accuracy = (hits/(hits+misses)) * 100;
          console.log(accuracy)
          
            // Deal damage based on score
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
          this.scene.physics.world.isPaused = false;
          this.scene.isPaused = false;

          this.gs.stop('RhythmGameScene'); 
        }
      });
    });
  }     
  
  update(time,delta) {
    if (this.healthText) {
      this.healthText.setPosition(this.x, this.y - 50);
    }
  } 
}
