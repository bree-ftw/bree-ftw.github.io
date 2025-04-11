import Bree from './Bree.js';
import { openMenu, MenuScene } from '../scenes/MenuScene.js'; // import MenuHelper

export default class Wizard extends Bree {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.className = 'Wizard';
    this.hp = 50;
    this.maxHp = 50;
    this.triviaQuestions = [];
    this.currentQuestion = 0;
  }

  preload() {
    // Load the trivia questions from the JSON file in assets/data
    this.scene.load.json('triviaQuestions', 'assets/data/trivia.json');
  }

  create() {
    // After loading, assign triviaQuestions from the loaded JSON
    this.triviaQuestions = this.scene.cache.json.get('triviaQuestions');
  }

  askTriviaQuestion() {
    const trivia = this.triviaQuestions[this.currentQuestion];
    const allAnswers = this.shuffleAnswers([trivia.correctAnswer, ...trivia.wrongAnswers]);

    const options = {};
    allAnswers.forEach((answer, index) => {
      options[answer] = null;
    });

    openMenu(this.scene, {
      prompt: trivia.question,
      options: options,
      callback: (selectedAnswer) => {
        this.answerTrivia(selectedAnswer, this.target); // Process the answer
      }
    });
  }

  answerTrivia(selectedAnswer, target) {
    const trivia = this.triviaQuestions[this.currentQuestion];
    if (selectedAnswer === trivia.correctAnswer) {
      console.log('Correct! You cast your spell.');
      target.takeDamage(75); // Deal damage to the enemy
      this.currentQuestion = (this.currentQuestion + 1) % this.triviaQuestions.length; // Move to the next question
    } else {
      console.log('Wrong answer! You lose.');
      this.die(); // Death if the answer is wrong
    }
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
