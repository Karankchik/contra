export class Pickup {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
    }

    collect(player) {
        switch (this.type) {
            case 'health':
                player.health = Math.min(player.health + 30, 100);
                break;
            case 'ammo':
                player.weapons.pistol.ammo = player.weapons.pistol.maxAmmo;
                break;
        }
    }

    render() {
        const ctx = this.game.ctx;
        let sprite = null;

        switch (this.type) {
            case 'health':
                sprite = this.game.sprites.health;
                break;
            case 'ammo':
                sprite = this.game.sprites.ammo;
                break;
        }

        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.type === 'health' ? '#ff0000' : '#ffff00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}