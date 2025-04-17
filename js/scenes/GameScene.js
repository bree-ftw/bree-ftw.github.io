
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.json('gameflow', 'assets/data/gameflow.json');
  }

  create() {
    this.gameFlow = this.cache.json.get('gameflow');
    this.player = {
      classType: "Dog",
      hp: 100,
      maxHp: 100,
      attackPower: 25,
      img: "up.png",
      setType: function (type) {
        this.classType=type
        switch (type) {
          case "Barbarian":
            this.classType = 'Barbarian';
            this.hp = 150;
            this.maxHp = 200;
            this.attackPower = 50;
            break;
          case "Bard":
            this.classType = 'Bard';
            this.hp = 100;
            this.maxHp = 100;
            this.attackPower = 0;
            break;
          case "Wizard":
            this.classType = 'Wizard';
            this.hp = 75;
            this.maxHp = 75;
            this.attackPower = 10;
            break;
          default:
            break;
        }
      }
    };

    this.currentStep = 'chooseCharacter';
    this.loadStep(this.currentStep);
  }

  loadStep(stepKey) {
    const step = this.gameFlow[stepKey];
    this.currentStep = stepKey;
    console.log(step)

    if (step.type === 'story') {
      console.log(step.text)
      this.scene.start('StoryScene', {
        text: step.text,
        pt: this.player.classType,
        onComplete: () => {
          this.scene.stop('StoryScene');
          if (step.next) this.loadStep(step.next);
        }
      });
    } else if (step.type === 'dialogue') {
      this.scene.start('DialogueScene', {
        dialogue: step,
        onComplete: () => {
          this.scene.stop('DialogueScene');
          if (step.next) this.loadStep(step.next);
        }
      });
    } else if (step.type === 'menu') {
      console.log(step.prompt)
      this.scene.start('MenuScene', {
        prompt: step.prompt,
        options: step.options,
        descriptions: step.descriptions || {},
        pt: this.player.classType,
        callback: (choice) => {
          this.scene.stop('MenuScene');
          console.log(choice, stepKey)
          if (stepKey === 'chooseCharacter') {
            this.player.setType(choice);
            console.log("set",choice,this.player.classType)
          }
          this.loadStep(step.options[choice]);
        }
      });
    } else if (step.type === 'combat') {
      console.log(step.enemies)
      this.scene.start('CombatScene', {
        enemies: step.enemies,
        player: this.player,
        levelKey: step.levelKey,
        onVictory: () => {
          this.scene.stop('CombatScene')
          this.scene.stop('MenuScene')
          if (step.next) this.loadStep(step.next);
        },
        onDefeat: () => {
          this.scene.stop('CombatScene')
          this.scene.stop('MenuScene')
          if (stepKey=="4.7") this.loadStep("4.7");
          else this.loadStep('combatDeath');
        }
      });
    } else if (step.type === 'boss') {
      this.scene.start('BossScene', {
        player: this.player,
        onVictory: () => {
          this.scene.stop('BossScene')
          this.scene.stop('MenuScene')
          if (step.next) this.loadStep(step.next);
        },
        onDefeat: () => {
          this.scene.stop('BossScene')
          this.scene.stop('MenuScene')
          if (stepKey=="4.7") this.loadStep("4.7");
          else this.loadStep('combatDeath');
        }
      });
    }
  }
}
