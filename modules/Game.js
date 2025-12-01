import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Bullet } from './Bullet.js';
import { Pickup } from './Pickup.js';
import { Particle } from './Particle.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.gameState = 'loading';
        this.lastTime = 0;

        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.platforms = [];
        this.pickups = [];
        this.particles = [];
        this.boss = null;

        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.maxLevel = 3;

        this.sprites = {};
        this.animations = {};
        this.loadedSprites = 0;
        this.totalSprites = 0;

        // Система камеры и уровня
        this.camera = {
            x: 0,
            y: 0,
            width: 1200,
            height: 500
        };

        this.levelWidth = 2400;
        this.levelHeight = 500;

        this.setupEventListeners();
        this.loadSprites();
    }

    loadSprites() {
        console.log("Начинаем загрузку спрайтов...");

        const spriteList = {
            // Спрайты игрока
            playerIdle: 'sprites/player.png',
            playerWalking1: 'sprites/PlayerWalking1.png',
            playerWalking2: 'sprites/PlayerWalking2.png',
            playerJumping1: 'sprites/PlayerJumping1.png',
            playerJumping2: 'sprites/PlayerJumping2.png',

            // Спрайты врага
            enemy1: 'sprites/enemy 1.png',
            enemy2: 'sprites/enemy 2.png',
            enemy3: 'sprites/enemy 3.png',
            enemy4: 'sprites/enemy 4.png',

            // Окружение и объекты
            platform: 'sprites/platform.png',
            health: 'sprites/health.png',
            ammo: 'sprites/bullets.png',
            background: 'sprites/background.jpg'
        };

        this.totalSprites = Object.keys(spriteList).length;

        Object.keys(spriteList).forEach(spriteName => {
            this.loadSprite(spriteName, spriteList[spriteName]);
        });
    }

    loadSprite(name, path) {
        const img = new Image();
        img.onload = () => {
            console.log(`Спрайт загружен: ${name}`);
            this.sprites[name] = img;
            this.loadedSprites++;

            if (this.loadedSprites === this.totalSprites) {
                console.log("Все спрайты загружены!");
                this.initAnimations();
                this.showMenu();
            }
        };

        img.onerror = () => {
            console.error(`Ошибка загрузки спрайта: ${path}`);
            this.createFallbackSprite(name);
            this.loadedSprites++;

            if (this.loadedSprites === this.totalSprites) {
                this.initAnimations();
                this.showMenu();
            }
        };

        img.src = path;
    }

    initAnimations() {
        // Анимации игрока
        this.animations.playerWalk = [
            this.sprites.playerWalking1,
            this.sprites.playerWalking2
        ];

        this.animations.playerJump = [
            this.sprites.playerJumping1,
            this.sprites.playerJumping2
        ];

        // Анимация врага
        this.animations.enemyWalk = [
            this.sprites.enemy1,
            this.sprites.enemy2,
            this.sprites.enemy3,
            this.sprites.enemy4
        ];
    }

    createFallbackSprite(name) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Определяем размеры в зависимости от типа спрайта
        if (name.includes('player')) {
            canvas.width = 40; canvas.height = 60;
            ctx.fillStyle = '#e94560';
            ctx.fillRect(0, 0, 40, 60);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';

            if (name.includes('Walking')) {
                ctx.fillText('WALK' + name.slice(-1), 5, 30);
            } else if (name.includes('Jumping')) {
                ctx.fillText('JUMP' + name.slice(-1), 5, 30);
            } else {
                ctx.fillText('PLAYER', 5, 30);
            }
        } else if (name.includes('enemy')) {
            canvas.width = 40; canvas.height = 60;
            ctx.fillStyle = '#00aa00';
            ctx.fillRect(0, 0, 40, 60);
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.fillText('ENEMY' + name.slice(-1), 5, 30);
        } else {
            // Остальные спрайты как раньше
            switch(name) {
                case 'platform':
                    canvas.width = 100; canvas.height = 20;
                    ctx.fillStyle = '#8b4513';
                    ctx.fillRect(0, 0, 100, 20);
                    break;
                case 'health':
                    canvas.width = 20; canvas.height = 20;
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(0, 0, 20, 20);
                    break;
                case 'ammo':
                    canvas.width = 20; canvas.height = 20;
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(0, 0, 20, 20);
                    break;
                case 'bullet':
                    canvas.width = 10; canvas.height = 5;
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(0, 0, 10, 5);
                    break;
                case 'background':
                    canvas.width = 2400; canvas.height = 500;
                    ctx.fillStyle = '#0f3460';
                    ctx.fillRect(0, 0, 2400, 500);
                    break;
            }
        }

        this.sprites[name] = canvas;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'KeyP') this.togglePause();
            if (e.code === 'Escape') this.showMenu();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop();
        }
    }

    start() {
        if (this.loadedSprites < this.totalSprites) {
            console.log("Еще не все спрайты загружены!");
            return;
        }

        this.hideMenu();
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;

        this.player = new Player(this);
        this.generateLevel();
        this.gameLoop();
    }

    showMenu() {
        document.getElementById('menu').classList.remove('hidden');
        this.gameState = 'menu';
    }

    hideMenu() {
        document.getElementById('menu').classList.add('hidden');
    }

    updateCamera() {
        // Камера следует за игроком
        this.camera.x = this.player.x - this.camera.width / 2;

        // Ограничиваем камеру границами уровня
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.levelWidth - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.levelHeight - this.camera.height));
    }

    generateLevel() {
        this.enemies = [];
        this.bullets = [];
        this.platforms = [];
        this.pickups = [];
        this.particles = [];
        this.boss = null;

        // Устанавливаем размеры уровня в зависимости от номера
        this.levelWidth = 2000 + (this.level * 400);
        this.levelHeight = 500;

        // Устанавливаем размер canvas
        this.canvas.width = this.camera.width;
        this.canvas.height = this.camera.height;

        // Увеличенные платформы для большего уровня
        if (this.level === 1) {
            this.platforms = [
                { x: 0, y: 450, width: 400, height: 20, id: 1 },
                { x: 450, y: 400, width: 300, height: 20, id: 2 },
                { x: 800, y: 350, width: 250, height: 20, id: 3 },
                { x: 1100, y: 300, width: 300, height: 20, id: 4 },
                { x: 1500, y: 400, width: 300, height: 20, id: 5 },
                { x: 1900, y: 350, width: 200, height: 20, id: 6 },
                { x: 0, y: 480, width: this.levelWidth, height: 20, id: 0 }
            ];

            // Враги на своих платформами
            this.enemies.push(new Enemy(this, 500, 380, 2));
            this.enemies.push(new Enemy(this, 850, 330, 3));
            this.enemies.push(new Enemy(this, 1200, 280, 4));
            this.enemies.push(new Enemy(this, 1600, 380, 5));

            // Бонусы
            this.pickups = [
                new Pickup(this, 420, 370, 'health'),
                new Pickup(this, 700, 320, 'ammo'),
                new Pickup(this, 1250, 270, 'health'),
                new Pickup(this, 1700, 370, 'ammo')
            ];

        } else if (this.level === 2) {
            this.platforms = [
                { x: 0, y: 450, width: 350, height: 20, id: 1 },
                { x: 400, y: 400, width: 300, height: 20, id: 2 },
                { x: 750, y: 350, width: 280, height: 20, id: 3 },
                { x: 1080, y: 300, width: 320, height: 20, id: 4 },
                { x: 1450, y: 250, width: 250, height: 20, id: 5 },
                { x: 1750, y: 400, width: 200, height: 20, id: 6 },
                { x: 2000, y: 350, width: 180, height: 20, id: 7 },
                { x: 2230, y: 300, width: 170, height: 20, id: 8 },
                { x: 0, y: 480, width: this.levelWidth, height: 20, id: 0 }
            ];

            // Больше врагов на уровне 2
            this.enemies.push(new Enemy(this, 450, 380, 2));
            this.enemies.push(new Enemy(this, 800, 330, 3));
            this.enemies.push(new Enemy(this, 1150, 280, 4));
            this.enemies.push(new Enemy(this, 1550, 230, 5));
            this.enemies.push(new Enemy(this, 1850, 380, 6));
            this.enemies.push(new Enemy(this, 2100, 330, 7));

            this.pickups = [
                new Pickup(this, 380, 370, 'ammo'),
                new Pickup(this, 900, 270, 'health'),
                new Pickup(this, 1300, 220, 'ammo'),
                new Pickup(this, 1650, 170, 'health'),
                new Pickup(this, 1950, 320, 'ammo'),
                new Pickup(this, 2300, 270, 'health')
            ];

        } else if (this.level === 3) {
            // Финальный уровень - самый большой
            this.platforms = [
                { x: 0, y: 450, width: 300, height: 20, id: 1 },
                { x: 350, y: 420, width: 280, height: 20, id: 2 },
                { x: 680, y: 390, width: 260, height: 20, id: 3 },
                { x: 990, y: 360, width: 240, height: 20, id: 4 },
                { x: 1280, y: 330, width: 220, height: 20, id: 5 },
                { x: 1550, y: 400, width: 200, height: 20, id: 6 },
                { x: 1800, y: 280, width: 180, height: 20, id: 7 },
                { x: 2030, y: 250, width: 160, height: 20, id: 8 },
                { x: 2240, y: 350, width: 140, height: 20, id: 9 },
                { x: 2430, y: 300, width: 120, height: 20, id: 10 },
                { x: 2600, y: 400, width: 100, height: 20, id: 11 },
                { x: 0, y: 480, width: this.levelWidth, height: 20, id: 0 }
            ];

            // Максимум врагов на уровне 3
            this.enemies.push(new Enemy(this, 400, 400, 2));
            this.enemies.push(new Enemy(this, 730, 370, 3));
            this.enemies.push(new Enemy(this, 1040, 340, 4));
            this.enemies.push(new Enemy(this, 1350, 310, 5));
            this.enemies.push(new Enemy(this, 1650, 380, 6));
            this.enemies.push(new Enemy(this, 1900, 260, 7));
            this.enemies.push(new Enemy(this, 2130, 230, 8));
            this.enemies.push(new Enemy(this, 2340, 330, 9));

            this.pickups = [
                new Pickup(this, 320, 370, 'health'),
                new Pickup(this, 600, 310, 'ammo'),
                new Pickup(this, 950, 280, 'health'),
                new Pickup(this, 1250, 250, 'ammo'),
                new Pickup(this, 1600, 320, 'health'),
                new Pickup(this, 1850, 200, 'ammo'),
                new Pickup(this, 2100, 150, 'health'),
                new Pickup(this, 2400, 250, 'ammo')
            ];
        }

        this.updateUI();
    }

    update(timestamp) {
        if (this.gameState !== 'playing') return;

        this.player.update();
        this.updateCamera();

        // Обновление врагов
        this.enemies.forEach((enemy, index) => {
            enemy.update();

            // Проверка столкновения с игроком
            if (this.checkCollision(this.player, enemy)) {
                this.player.takeDamage(20);
                // Враг отталкивается от игрока при столкновении
                enemy.x += enemy.direction * 10;
            }

            // Враг умирает только от пуль
            if (enemy.health <= 0) {
                this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                this.enemies.splice(index, 1);
                this.score += 100;
            }
        });

        // Обновление пуль
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.x < -50 || bullet.x > this.levelWidth + 50) {
                this.bullets.splice(index, 1);
            }
        });

        // Обновление бонусов
        this.pickups.forEach((pickup, index) => {
            if (this.checkCollision(this.player, pickup)) {
                pickup.collect(this.player);
                this.pickups.splice(index, 1);
            }
        });

        // Обновление частиц
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        this.checkCollisions();
        this.updateUI();

        if (this.enemies.length === 0) {
            this.levelComplete();
        }
    }

    checkCollisions() {
        this.bullets.forEach((bullet, bIndex) => {
            if (!bullet.isEnemy) {
                this.enemies.forEach((enemy, eIndex) => {
                    if (this.checkCollision(bullet, enemy)) {
                        enemy.takeDamage(bullet.damage);
                        this.bullets.splice(bIndex, 1);
                    }
                });
            }
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(this, x, y));
        }
    }

    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('score').textContent = this.score.toString().padStart(6, '0');
        document.getElementById('enemies').textContent = this.enemies.length;

        if (this.player) {
            const weapon = this.player.weapons[this.player.currentWeapon];
            document.getElementById('ammo').textContent = weapon.ammo;
            document.getElementById('health').textContent = this.player.health;
        }
    }

    render() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Сохраняем контекст для трансформаций камеры
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Рендер фона
        if (this.sprites.background) {
            // Рисуем фон, растягивая его на всю ширину уровня
            this.ctx.drawImage(this.sprites.background, 0, 0, this.levelWidth, this.levelHeight);
        } else {
            this.ctx.fillStyle = '#0f3460';
            this.ctx.fillRect(0, 0, this.levelWidth, this.levelHeight);
        }

        // Рендер платформ
        this.platforms.forEach(platform => {
            if (this.sprites.platform) {
                this.ctx.drawImage(this.sprites.platform, platform.x, platform.y, platform.width, platform.height);
            } else {
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
        });

        // Рендер бонусов
        this.pickups.forEach(pickup => {
            pickup.render();
        });

        // Рендер врагов
        this.enemies.forEach(enemy => {
            enemy.render();
        });

        // Рендер пуль
        this.bullets.forEach(bullet => {
            bullet.render();
        });

        // Рендер частиц
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });

        // Рендер игрока
        if (this.player) {
            this.player.render();
        }

        // Восстанавливаем контекст
        this.ctx.restore();

        // Рендер экранов состояний
        this.renderGameStateScreens();
    }

    renderGameStateScreens() {
        // Рендер экрана загрузки
        if (this.gameState === 'loading') {
            this.renderLoadingScreen();
        }

        // Рендер экрана победы
        if (this.gameState === 'win') {
            this.renderWinScreen();
        }

        // Рендер экрана проигрыша
        if (this.gameState === 'gameOver') {
            this.renderGameOverScreen();
        }

        // Рендер паузы
        if (this.gameState === 'paused') {
            this.renderPauseScreen();
        }

        // Рендер завершения уровня
        if (this.gameState === 'levelComplete') {
            this.renderLevelCompleteScreen();
        }
    }

    renderLoadingScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`LOADING: ${this.loadedSprites}/${this.totalSprites}`,
            this.canvas.width/2, this.canvas.height/2);
    }

    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillText('PRESS P TO CONTINUE', this.canvas.width/2, this.canvas.height/2 + 20);
    }

    renderGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 40);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width/2, this.canvas.height/2);
        this.ctx.fillText(`LEVEL: ${this.level}`, this.canvas.width/2, this.canvas.height/2 + 25);
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillText('PRESS ESC FOR MENU', this.canvas.width/2, this.canvas.height/2 + 60);
    }

    renderWinScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY!', this.canvas.width/2, this.canvas.height/2 - 50);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.fillText(`LIVES: ${this.lives}`, this.canvas.width/2, this.canvas.height/2 + 5);
        this.ctx.fillText(`LEVELS: ${this.maxLevel}`, this.canvas.width/2, this.canvas.height/2 + 30);
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillText('PRESS ESC FOR MENU', this.canvas.width/2, this.canvas.height/2 + 70);
    }

    renderLevelCompleteScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width/2, this.canvas.height/2 - 30);

        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width/2, this.canvas.height/2);
        this.ctx.fillText(`LIVES: ${this.lives}`, this.canvas.width/2, this.canvas.height/2 + 25);
        this.ctx.fillText('PRESS ANY KEY TO CONTINUE', this.canvas.width/2, this.canvas.height/2 + 60);
    }

    handleLevelComplete() {
        this.level++;
        if (this.level <= this.maxLevel) {
            this.gameState = 'levelComplete';
            // Ждем нажатия любой клавиши для продолжения
            const continueHandler = (e) => {
                if (this.gameState === 'levelComplete') {
                    document.removeEventListener('keydown', continueHandler);
                    this.generateLevel();
                    this.player.x = 50;
                    this.player.y = 400;
                    this.camera.x = 0;
                    this.gameState = 'playing';
                    this.gameLoop();
                }
            };
            document.addEventListener('keydown', continueHandler);
        } else {
            this.winGame();
        }
    }

    levelComplete() {
        this.handleLevelComplete();
    }

    winGame() {
        this.gameState = 'win';
    }

    gameLoop(timestamp) {
        this.update(timestamp);
        this.render();

        if (this.gameState === 'playing') {
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    // Методы для меню
    showInstructions() {
        document.getElementById('instructions').classList.remove('hidden');
        document.getElementById('menu').classList.add('hidden');
    }

    hideInstructions() {
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
    }
}