export class Enemy {
    constructor(game, x, y, platformId) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.health = 4;
        this.speed = 0.8 + (game.level * 0.2);
        this.direction = 1;
        this.platformId = platformId;
        this.currentPlatform = null;

        // Анимация
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 200;

        this.findPlatform();
    }

    findPlatform() {
        this.currentPlatform = this.game.platforms.find(platform => platform.id === this.platformId);
        if (this.currentPlatform) {
            this.y = this.currentPlatform.y - this.height;
        }
    }

    update() {
        if (!this.currentPlatform) {
            this.findPlatform();
            return;
        }

        this.x += this.speed * this.direction;

        if (this.x <= this.currentPlatform.x) {
            this.x = this.currentPlatform.x;
            this.direction = 1;
        } else if (this.x + this.width >= this.currentPlatform.x + this.currentPlatform.width) {
            this.x = this.currentPlatform.x + this.currentPlatform.width - this.width;
            this.direction = -1;
        }

        this.y += 0.5;

        this.game.platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y + this.height > platform.y &&
                this.y < platform.y) {

                this.y = platform.y - this.height;
            }
        });

        this.animationTimer += 16;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % this.game.animations.enemyWalk.length;
            this.animationTimer = 0;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
    }

    render() {
        const ctx = this.game.ctx;
        const sprite = this.game.animations.enemyWalk[this.animationFrame];

        if (sprite) {
            ctx.save();
            if (this.direction === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
            } else {
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = '#00aa00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}