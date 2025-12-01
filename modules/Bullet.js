export class Bullet {
    constructor(game, x, y, direction, isEnemy, damage = 1) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 4;
        this.speed = 8;
        this.direction = direction;
        this.isEnemy = isEnemy;
        this.damage = damage;
    }

    update() {
        this.x += this.direction === 'right' ? this.speed : -this.speed;
    }

    render() {
        const ctx = this.game.ctx;
        if (this.game.sprites.bullet) {
            ctx.drawImage(this.game.sprites.bullet, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.isEnemy ? '#ff0000' : '#ffff00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}