import Phaser from 'phaser';
import { openMenu, MenuScene } from '../scenes/MenuScene.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelData = data.levelData || [];
    this.currentStoryNode = 0;
    this.playerClass = null; // Store the player's class here
  }

  preload() {
    // Preload assets if necessary
  }

  create() {
    // First, ask the player to choose a character (Barbarian, Wizard, Bard)
    if (!this.playerClass) {
      this.showCharacterSelection();
    } else {
      this.processStoryNode();
    }
  }

  showCharacterSelection() {
    openMenu(this, {
      prompt: "Choose your character:",
      options: {
        "1": { text: "Barbarian", nextNode: "startGameWithBarbarian" },
        "2": { text: "Wizard", nextNode: "startGameWithWizard" },
        "3": { text: "Bard", nextNode: "startGameWithBard" }
      },
      callback: (selectedOption) => {
        const selection = {
          "1": "Barbarian",
          "2": "Wizard",
          "3": "Bard"
        };
        this.playerClass = selection[selectedOption];
        this.startGame();
      }
    });
  }

  startGame() {
    // Now that the character is selected, begin the game with the selected class
    const player = this.createPlayerByClass(this.playerClass);
    this.scene.start('CombatScene', {
      player: player,
      levelKey: 'Level1', // Or wherever the player starts
      onVictory: () => {
        this.currentStoryNode++;
        this.processStoryNode();
      },
      onDefeat: () => {
        this.currentStoryNode++; // Optionally handle defeat state
        this.processStoryNode();
      }
    });
  }

  createPlayerByClass(classType) {
    let player;
    switch (classType) {
      case 'Barbarian':
        player = new Barbarian(this, 100, 100); // Adjust based on your actual class setup
        break;
      case 'Wizard':
        player = new Wizard(this, 100, 100);
        break;
      case 'Bard':
        player = new Bard(this, 100, 100);
        break;
      default:
        console.error('Invalid class selected');
        break;
    }
    return player;
  }

  processStoryNode() {
    const node = this.levelData[this.currentStoryNode];

    if (!node) {
      console.log("No more story nodes!");
      return;
    }

    switch (node.type) {
      case "combat":
        this.startCombat(node);
        break;
      case "decision":
        this.showDecision(node);
        break;
      case "powerup":
        this.givePowerup(node);
        break;
      case "story":
        this.showStory(node);
        break;
      case "end":
        this.endGame();
        break;
      default:
        console.log("Unknown node type");
        break;
    }
  }

  startCombat(node) {
    const player = new this.game.scene.getScene('CombatScene').player; // Pass your player object here
    this.scene.start('CombatScene', {
      player: player,
      levelKey: node.levelKey,
      onVictory: () => {
        this.currentStoryNode++;
        this.processStoryNode();
      },
      onDefeat: () => {
        this.currentStoryNode++; // Optionally handle defeat state
        this.processStoryNode();
      }
    });
  }

  showDecision(node) {
    openMenu(this, {
      prompt: node.prompt,
      options: node.options,
      callback: (selectedOption) => {
        this.currentStoryNode = node.options[selectedOption].nextNode;
        this.processStoryNode();
      }
    });
  }

  givePowerup(node) {
    // Add logic to give player powerups here
    this.showStory({
      type: "story",
      text: "You gained a power-up! Now go ahead!"
    });
  }

  showStory(node) {
    // Display scrolling text
    this.add.text(50, 100, node.text, {
      fontSize: '24px',
      fill: '#fff',
      wordWrap: { width: 700 }
    });

    // Automatically progress after some delay
    this.time.delayedCall(4000, () => {
      this.currentStoryNode++;
      this.processStoryNode();
    });
  }

  endGame() {
    // Handle game ending or transition
    console.log('Game Over or Victory!');
    // Transition to end scene or restart
    this.scene.start('EndScene');
  }

  update(time, delta) {
    // Handle any updates like moving player or other game systems
  }
}
