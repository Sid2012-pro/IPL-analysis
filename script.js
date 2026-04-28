const playerBar = document.getElementById('player-momentum');
const enemyBar = document.getElementById('enemy-momentum');
const playerHpBar = document.getElementById('player-hp');
const enemyHpBar = document.getElementById('enemy-hp');
const sitBtn = document.getElementById('sit-button');
const canvas = document.getElementById('battle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 980;
canvas.height = 540;

const SIT_LIBRARY = {
    'Hanged Man': { color: '#7f8c8d', fmgBonus: 4, momGain: 6, ability: 'Momentum Drain' },
    'Emperor': { color: '#f1c40f', fmgBonus: 6, momGain: 2, ability: 'Zone Hold' },
    'The Star': { color: '#9b59b6', fmgBonus: 3, momGain: 12, ability: 'Perfect Cancel' },
    'Garuda': { color: '#e67e22', fmgBonus: 5, momGain: 8, ability: 'Predator Snap' },
    'Kali': { color: '#e74c3c', fmgBonus: 8, momGain: 5, ability: 'Fury Build' },
    'Shesha': { color: '#2ecc71', fmgBonus: 2, momGain: 4, ability: 'Momentum Lock' }
};

class Fighter {
    constructor(name, isPlayer, xPos) {
        this.name = name;
        this.isPlayer = isPlayer;
        this.hp = 100;
        this.momentum = 30;
        this.STATE = "IDLE";
        this.x = xPos;
        this.y = 400;
        this.width = 40;
        this.height = 100;
        this.velocityX = 0;
        this.velocityY = 0;
        this.friction = 0.85;
        this.gravity = 0.6;
        this.facing = isPlayer ? 1 : -1;
        this.baseColor = isPlayer ? '#00d2ff' : '#dc281e';
        this.currentColor = this.baseColor;
        this.attackRange = 0;
        this.attackActive = false;
        
        this.currentSIT = isPlayer ? 'The Star' : null;
        this.sitManifested = false;
        this.sitOffset = { x: isPlayer ? -50 : 50, y: -20 };
    }

    updateUI() {
        const mBar = this.isPlayer ? playerBar : enemyBar;
        const hBar = this.isPlayer ? playerHpBar : enemyHpBar;
        
        mBar.style.width = `${Math.max(0, Math.min(100, this.momentum))}%`;
        hBar.style.width = `${Math.max(0, Math.min(100, this.hp))}%`;

        if (this.isPlayer) {
            if (this.momentum >= 70 && !this.sitManifested) {
                sitBtn.classList.replace('unavailable', 'available');
            } else if (!this.sitManifested) {
                sitBtn.classList.replace('available', 'unavailable');
            }
        }
    }

    applyPhysics(opponent) {
        if (this.STATE === "KO") return;
        
        if (this.STATE !== "ATTACKING" && this.STATE !== "STUNNED") {
            if (this.x < opponent.x) this.facing = 1;
            else this.facing = -1;
        }

        this.velocityX *= this.friction;
        this.x += this.velocityX;
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y > 400) {
            this.y = 400;
            this.velocityY = 0;
        }

        this.x = Math.max(20, Math.min(canvas.width - 20, this.x));
    }

    draw() {
        if (this.sitManifested && this.currentSIT) {
            this.drawSIT();
        }

        this.drawFighter();
    }

    drawFighter() {
        ctx.save();
        
        ctx.fillStyle = this.STATE === "STUNNED" ? '#555' : (this.STATE === "KO" ? '#000' : this.currentColor);
        
        if (this.STATE === "SYNC") {
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.currentColor;
        }
        
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);

        if (this.STATE !== "KO") {
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + (15 * this.facing), this.y - 85, 8, 8);
        }

        if (this.attackActive) {
            ctx.fillStyle = this.sitManifested ? this.currentColor : 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.x + (this.width/2 * this.facing) + (this.facing === -1 ? -this.attackRange : 0), this.y - 70, this.attackRange, 30);
        }
        
        ctx.restore();
    }

    drawSIT() {
        const sitData = SIT_LIBRARY[this.currentSIT];
        
        ctx.save();
        
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = sitData.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = sitData.color;
        
        const sitWidth = this.width * 1.5;
        const sitHeight = this.height * 1.3;
        
        const sitX = this.x + (this.sitOffset.x * this.facing);
        const sitY = this.y + this.sitOffset.y;
        
        ctx.fillRect(sitX - sitWidth / 2, sitY - sitHeight, sitWidth, sitHeight);
        
        if (this.attackActive) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#fff';
             ctx.fillRect(sitX + (sitWidth/2 * this.facing) + (this.facing === -1 ? -(this.attackRange + 20) : 0), sitY - 90, this.attackRange + 20, 50);
        }
        
        ctx.restore();
    }
}

const player = new Fighter('Pilot', true, 250);
const enemy = new Fighter('Enemy', false, 730);

function spawnVFX(text, x, y, color = '#333') {
    const vfx = document.createElement('div');
    vfx.className = 'onomatopoeia';
    vfx.innerText = text;
    vfx.style.left = `${x}px`;
    vfx.style.top = `${y}px`;
    vfx.style.color = color;
    if (color !== '#333') vfx.style.textShadow = `2px 2px 0px #fff, 0 0 10px ${color}`;
    
    const angle = (Math.random() - 0.5) * 30;
    vfx.style.transform = `rotate(${angle}deg)`;
    document.getElementById('game-container').appendChild(vfx);
    setTimeout(() => vfx.remove(), 800);
}

function checkDeath() {
    if (player.hp <= 0 || enemy.hp <= 0) {
        const winner = player.hp <= 0 ? enemy : player;
        const loser = player.hp <= 0 ? player : enemy;

        loser.hp = 0;
        loser.STATE = "KO";
        loser.sitManifested = false;
        winner.STATE = "IDLE";
        
        spawnVFX("RETIRED!!", loser.x, loser.y - 120, '#000');
        document.getElementById('game-container').style.filter = "grayscale(100%) contrast(150%)";
        
        player.updateUI();
        enemy.updateUI();
        return true;
    }
    return false;
}

function modifyMomentum(actor, opponent, amount) {
    if (player.STATE === "KO" || enemy.STATE === "KO") return;
    actor.momentum += amount;
    let diff = Math.abs(actor.momentum - opponent.momentum);
    let dist = Math.abs(actor.x - opponent.x);
    
    if (diff <= 10 && dist < 200) {
        spawnVFX("SNAP!", (actor.x + opponent.x) / 2, actor.y - 120, '#ff0055');
        actor.momentum += 10;
        opponent.momentum -= 10;
        actor.velocityX = actor.facing * -30;
        opponent.velocityX = opponent.facing * -30;
        
        opponent.STATE = 'STUNNED';
        setTimeout(() => { if(opponent.STATE === 'STUNNED') opponent.STATE = 'IDLE'; }, 500);
    }
    
    actor.updateUI();
    opponent.updateUI();
}

function executeMove(actor, opponent, moveType, damage, mGain, sTime, activeTime, range, knockback) {
    if (actor.STATE !== 'IDLE' && actor.STATE !== 'SYNC') return;

    const prevState = actor.STATE;
    actor.STATE = 'ATTACKING';
    
    let effectiveDamage = damage;
    let effectiveMGain = mGain;
    let effectiveRange = range;
    let vfxColor = '#333';

    if (actor.sitManifested && actor.currentSIT) {
        const sitData = SIT_LIBRARY[actor.currentSIT];
        effectiveDamage += sitData.fmgBonus;
        effectiveMGain += sitData.momGain;
        effectiveRange += 30;
        vfxColor = sitData.color;
        sTime *= 0.8;
    }
    
    actor.velocityX = actor.facing * (actor.sitManifested ? 10 : 5);
    
    const attackTimeout = setTimeout(() => {
        if (actor.STATE === 'CANCELLED' || actor.STATE === "KO") return;

        actor.attackActive = true;
        actor.attackRange = effectiveRange;

        const dist = Math.abs(actor.x - opponent.x);
        const rightDirection = (actor.facing === 1 && actor.x < opponent.x) || (actor.facing === -1 && actor.x > opponent.x);

        if (dist < effectiveRange + (actor.width/2) + (opponent.width/2) && rightDirection && opponent.STATE !== 'KO') {
            opponent.hp -= effectiveDamage;
            opponent.updateUI();
            
            if (checkDeath()) return;

            opponent.STATE = 'STUNNED';
            opponent.velocityX = actor.facing * knockback * (actor.sitManifested ? 1.5 : 1);
            modifyMomentum(actor, opponent, effectiveMGain);
            
            const words = actor.sitManifested ? ["ORA!", "MUDA!", "DORA!", "WRYYY!"] : ["BAM!", "CRASH!", "303!!", "THWACK!"];
            spawnVFX(words[Math.floor(Math.random() * words.length)], opponent.x, opponent.y - 80, vfxColor);

            setTimeout(() => {
                if (opponent.STATE === 'STUNNED') opponent.STATE = 'IDLE';
            }, actor.sitManifested ? 500 : 300);
        }

        setTimeout(() => {
            actor.attackActive = false;
            if (actor.STATE === 'ATTACKING') actor.STATE = prevState;
        }, activeTime);

    }, sTime);

    actor.currentAttack = attackTimeout;
}

function toggleSIT() {
    if (player.momentum >= 70 && !player.sitManifested) {
        player.STATE = "SYNC";
        player.sitManifested = true;
        const sitData = SIT_LIBRARY[player.currentSIT];
        player.currentColor = sitData.color;
        sitBtn.classList.add('active');
        spawnVFX("SYNC!!", player.x, player.y - 120, sitData.color);
    } else if (player.sitManifested) {
        player.STATE = "IDLE";
        player.sitManifested = false;
        player.currentColor = player.baseColor;
        sitBtn.classList.remove('active');
        spawnVFX("UNSYNC!", player.x, player.y - 120);
    }
    player.updateUI();
}

function enemyAI() {
    if (enemy.STATE !== 'IDLE' && enemy.STATE !== 'SYNC') return;

    const dist = Math.abs(player.x - enemy.x);

    if (dist > 150) {
        enemy.velocityX += enemy.facing * 1.5;
    } else {
        if (Math.random() > 0.90) {
            const decision = Math.random();
            if (decision > 0.6) {
                executeMove(enemy, player, 'JAB', 5, 4, 150, 100, 80, 15);
            } else if (decision > 0.3) {
                executeMove(enemy, player, 'HEAVY', 12, 10, 400, 150, 110, 25);
            } else if (player.STATE === 'ATTACKING' && Math.random() > 0.7) {
                 enemy.velocityY = -10;
                 enemy.velocityX = enemy.facing * -10;
                 spawnVFX("DODGE!", enemy.x, enemy.y - 80);
            }
        }
    }

    if (Math.random() > 0.99 && enemy.y === 400) {
        enemy.velocityY = -12;
    }
}

window.addEventListener('keydown', (e) => {
    if (player.STATE === "KO" || enemy.STATE === "KO") return;

    switch(e.key.toLowerCase()) {
        case 'q': executeMove(player, enemy, 'POKE', 5, 4, 150, 100, 80, 15); break;
        case 'w': executeMove(player, enemy, 'PHYSICAL', 12, 10, 350, 150, 110, 25); break;
        case 'e': executeMove(player, enemy, 'HAMON', 8, 15, 250, 120, 90, 10); break;
        case 'r': toggleSIT(); break;
        case ' ':
            if (player.STATE === "ATTACKING") {
                clearTimeout(player.currentAttack);
                player.STATE = "CANCELLED";
                player.attackActive = false;
                player.momentum -= 5;
                
                if (player.currentSIT === 'The Star' && player.sitManifested) {
                    player.momentum += 2;
                    spawnVFX("STAR REFUND!", player.x, player.y - 120, SIT_LIBRARY['The Star'].color);
                }
                
                player.updateUI();
                spawnVFX("CANCEL!", player.x, player.y - 80);
                setTimeout(() => { if(player.STATE === 'CANCELLED') player.STATE = 'IDLE'; }, 100);
            }
            break;
    }

    if (player.STATE !== 'STUNNED' && player.STATE !== 'ATTACKING') {
        if (e.key === 'ArrowRight') player.velocityX += 8;
        if (e.key === 'ArrowLeft') player.velocityX -= 8;
        if (e.key === 'ArrowUp' && player.y === 400) player.velocityY = -14;
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.applyPhysics(enemy);
    enemy.applyPhysics(player);

    if (player.STATE !== "KO" && enemy.STATE !== "KO") {
        enemyAI();
    }

    if (player.sitManifested) {
        player.momentum -= 0.25;
        if (player.momentum <= 0) toggleSIT();
        player.updateUI();
    }

    player.draw();
    enemy.draw();

    requestAnimationFrame(gameLoop);
}

player.updateUI();
enemy.updateUI();
gameLoop();