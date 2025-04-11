// js/scenes/MenuScene.js
export default class MenuScene extends Phaser.Scene {
    constructor() {
      super('MenuScene');
    }
  
    init(data) {
      this.prompt = data.prompt || 'Make a choice:';
      this.options = data.options || {};
      this.callback = data.callback || (() => {});
    }
  
    create() {
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;
  
      this.add.text(centerX, 100, this.prompt, {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0.5);
  
      const optionKeys = Object.keys(this.options);
      const spacing = 70;
  
      optionKeys.forEach((key, index) => {
        const y = centerY + index * spacing;
        
        const button = this.add.text(centerX, y, key, {
          fontSize: '20px',
          backgroundColor: '#333',
          padding: { x: 10, y: 5 },
          color: '#fff'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => button.setStyle({ backgroundColor: '#555' }))
        .on('pointerout', () => button.setStyle({ backgroundColor: '#333' }))
        .on('pointerdown', () => {
          this.scene.stop('MenuScene');
          this.callback(key);
        });

        if (this.options[key]!=null) { // description
          this.add.text(centerX, y + 25, this.options[key], {
            fontSize: '14px',
            color: '#aaaaaa'
          }).setOrigin(0.5);
        }
      });
    }
  }
  
  export function openMenu(scene, { prompt, options, callback }) {
    scene.scene.launch('MenuScene', {
      prompt,
      options,
      callback
    });
  }