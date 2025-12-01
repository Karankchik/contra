import { Bullet } from './Bullet.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.x = 50;
        this.y = 400;
        this.width = 40;
        this.height = 60;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 3;
        this.jumpPower = 15;
        this.isJumping = false;
        this.facing = 'right';
        this.health = 100;
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        // Анимации
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.walkAnimationSpeed = 150;
        this.jumpAnimationSpeed = 200;

        this.weapons = {
            pistol: { name: 'ПИСТОЛЕТ', damage: 1, fireRate: 500, ammo: 100, maxAmmo: 100 }
        };
        this.currentWeapon = 'pistol';
        this.lastShot = 0;
    }

    takeDamage(damage) {
        if (this.invulnerable) return;

        this.health -= damage;
        this.invulnerable = true;
        this.invulnerableTimer = 60;

        if (this.health <= 0) {
            this.game.lives--;
            if (this.game.lives <= 0) {
                this.game.gameState = 'gameOver';
            } else {
                this.respawn();
            }
        }
    }

    respawn() {
        this.x = 50;
        this.y = 400;
        this.velocityY = 0;
        this.isJumping = false;
        this.health = 100;
        this.invulnerable = false;
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update() {
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        this.velocityX = 0;
        let isMoving = false;

        if (this.game.keys['KeyA'] || this.game.keys['ArrowLeft']) {
            this.velocityX = -this.speed;
            this.facing = 'left';
            isMoving = true;
        }
        if (this.game.keys['KeyD'] || this.game.keys['ArrowRight']) {
            this.velocityX = this.speed;
            this.facing = 'right';
            isMoving = true;
        }

        if ((this.game.keys['Space'] || this.game.keys['ArrowUp'] || this.game.keys['KeyW']) && !this.isJumping) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }

        if (this.game.keys['KeyZ'] && Date.now() - this.lastShot > this.weapons[this.currentWeapon].fireRate) {
            this.shoot();
        }

        // Обновление анимации
        this.animationTimer += 16;

        let newAnimation = 'idle';
        if (this.isJumping) {
            newAnimation = 'jump';
        } else if (isMoving) {
            newAnimation = 'walk';
        }

        if (this.currentAnimation !== newAnimation) {
            this.currentAnimation = newAnimation;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }

        if (this.currentAnimation === 'walk') {
            if (this.animationTimer >= this.walkAnimationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % this.game.animations.playerWalk.length;
                this.animationTimer = 0;
            }
        } else if (this.currentAnimation === 'jump') {
            if (this.animationTimer >= this.jumpAnimationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % this.game.animations.playerJump.length;
                this.animationTimer = 0;
            }
        } else {
            this.animationFrame = 0;
        }

        this.velocityY += 0.8;

        this.x += this.velocityX;
        this.y += this.velocityY;

        // Ограничение игрока границами уровня
        this.x = Math.max(0, Math.min(this.x, this.game.levelWidth - this.width));

        this.game.platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y + this.height > platform.y &&
                this.y < platform.y) {

                if (this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isJumping = false;
                    if (this.currentAnimation === 'jump') {
                        this.currentAnimation = 'idle';
                        this.animationFrame = 0;
                        this.animationTimer = 0;
                    }
                }
            }
        });

        if (this.y > this.game.levelHeight) {
            this.takeDamage(50);
        }
    }

    shoot() {
        const weapon = this.weapons[this.currentWeapon];
        if (weapon.ammo <= 0) return;

        weapon.ammo--;
        this.lastShot = Date.now();

        const bulletX = this.facing === 'right' ? this.x + this.width : this.x - 10;
        this.game.bullets.push(new Bullet(this.game, bulletX, this.y + this.height / 2, this.facing, false, weapon.damage));
    }

    render() {
        const ctx = this.game.ctx;

        // Мигание при неуязвимости
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            return;
        }

        let sprite;
        switch (this.currentAnimation) {
            case 'walk':
                sprite = this.game.animations.playerWalk[this.animationFrame];
                break;
            case 'jump':
                sprite = this.game.animations.playerJump[this.animationFrame];
                break;
            default:
                sprite = this.game.sprites.playerIdle;
        }

        if (sprite) {
            ctx.save();
            if (this.facing === 'left') {
                if (this.currentAnimation === 'jump') {
                    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
                } else {
                    ctx.scale(-1, 1);
                    ctx.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
                }
            } else {
                if (this.currentAnimation === 'jump') {
                    ctx.scale(-1, 1);
                    ctx.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
                } else {
                    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
                }
            }
            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = '#e94560';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px Arial';
            ctx.fillText(this.currentAnimation.toUpperCase(), this.x + 5, this.y + 30);
        }
    }
}