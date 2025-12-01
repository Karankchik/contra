import { Game } from './Game.js';

// Инициализация игры при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    // Экспортируем методы для доступа из HTML
    window.game = game;
    window.showInstructions = () => game.showInstructions();
    window.hideInstructions = () => game.hideInstructions();

    // Старт игры при нажатии кнопки в меню
    document.getElementById('startButton').addEventListener('click', () => game.start());
});