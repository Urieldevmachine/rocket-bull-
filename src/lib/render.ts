import { GAME_HEIGHT, GAME_WIDTH, COLORS } from '../constants';
import { Player, Obstacle, Entity, Particle, Boss } from '../types';

export function drawSky(ctx: CanvasRenderingContext2D, theme?: string) {
  if (theme === 'CYBER_SPACE') {
    // Deep dark matrix atmosphere
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#020d04');
    gradient.addColorStop(1, '#0b1f0d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Matrix green grid
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < GAME_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GAME_HEIGHT);
      ctx.stroke();
    }
    
    // Draw cyberspace cyber towers
    ctx.save();
    ctx.fillStyle = 'rgba(5, 30, 10, 0.6)';
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.25)';
    ctx.lineWidth = 1.5;
    const towers = [
      { x: 50, w: 60, h: 220 },
      { x: 180, w: 90, h: 180 },
      { x: 310, w: 50, h: 260 },
      { x: 440, w: 100, h: 190 },
      { x: 600, w: 70, h: 230 }
    ];
    towers.forEach(t => {
      ctx.fillRect(t.x, GAME_HEIGHT - t.h, t.w, t.h);
      ctx.strokeRect(t.x, GAME_HEIGHT - t.h, t.w, t.h);
      ctx.fillStyle = 'rgba(57, 255, 20, 0.4)';
      for (let wy = GAME_HEIGHT - t.h + 20; wy < GAME_HEIGHT - 60; wy += 35) {
        for (let wx = t.x + 10; wx < t.x + t.w - 10; wx += 20) {
          if (Math.random() > 0.3) {
            ctx.fillRect(wx, wy, 6, 12);
          }
        }
      }
      ctx.fillStyle = 'rgba(5, 30, 10, 0.6)';
    });
    ctx.restore();

  } else if (theme === 'LAVA_VOLCANO') {
    // Volcanic ash sky
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#150505');
    gradient.addColorStop(0.5, '#2e0a0a');
    gradient.addColorStop(1, '#ff3c00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.save();
    ctx.fillStyle = '#311010';
    ctx.strokeStyle = '#ff3c00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-50, GAME_HEIGHT - 40);
    ctx.lineTo(150, GAME_HEIGHT - 220);
    ctx.lineTo(190, GAME_HEIGHT - 220);
    ctx.lineTo(350, GAME_HEIGHT - 40);
    ctx.lineTo(400, GAME_HEIGHT - 40);
    ctx.lineTo(550, GAME_HEIGHT - 250);
    ctx.lineTo(600, GAME_HEIGHT - 250);
    ctx.lineTo(780, GAME_HEIGHT - 40);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 40);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff7b00';
    ctx.fillRect(155, GAME_HEIGHT - 220, 30, 8);
    ctx.fillRect(555, GAME_HEIGHT - 250, 40, 8);

    for (let i = 0; i < 15; i++) {
      const ashX = (Date.now() / 30 + i * 130) % GAME_WIDTH;
      const ashY = (GAME_HEIGHT - 60 - (Date.now() / 20 + i * 50) % 250);
      ctx.fillStyle = Math.random() > 0.5 ? '#ff3c00' : '#ff9d00';
      ctx.beginPath();
      ctx.arc(ashX, ashY, 2 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

  } else if (theme === 'ASTRO_NEBULA') {
    // Interstellar deep space nebula
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#040212');
    gradient.addColorStop(0.5, '#0c0728');
    gradient.addColorStop(1, '#25083c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 40; i++) {
       const starX = (i * 73 + 12) % GAME_WIDTH;
       const starY = (i * 57 + 41) % (GAME_HEIGHT - 80);
       const alpha = 0.3 + Math.abs(Math.sin((Date.now() / 400) + i)) * 0.7;
       ctx.globalAlpha = alpha;
       ctx.fillRect(starX, starY, 1.8, 1.8);
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#8A2BE2';
    ctx.shadowBlur = 20;
    const planetGrad = ctx.createRadialGradient(GAME_WIDTH - 150, 100, 5, GAME_WIDTH - 150, 100, 35);
    planetGrad.addColorStop(0, '#ffffff');
    planetGrad.addColorStop(0.4, '#da70d6');
    planetGrad.addColorStop(1, '#483d8b');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(GAME_WIDTH - 150, 100, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(218, 112, 214, 0.45)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(GAME_WIDTH - 150, 100, 50, 10, -Math.PI / 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

  } else if (theme === 'HARDCORE_CHAOS') {
    // Crimson endtime sky
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.4, '#1b0000');
    gradient.addColorStop(1, '#7a0010');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Lightning strike random flashes
    if (Math.random() < 0.04) {
       ctx.fillStyle = 'rgba(255, 215, 0, 0.22)';
       ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
       
       ctx.strokeStyle = '#ffd700';
       ctx.lineWidth = 3;
       ctx.beginPath();
       ctx.moveTo(GAME_WIDTH / 2 + (Math.random() - 0.5) * 400, 0);
       ctx.lineTo(GAME_WIDTH / 2 + (Math.random() - 0.5) * 200, GAME_HEIGHT / 2);
       ctx.lineTo(GAME_WIDTH / 2 + (Math.random() - 0.5) * 100, GAME_HEIGHT - 40);
       ctx.stroke();
    }

    ctx.save();
    ctx.fillStyle = '#110202';
    ctx.strokeStyle = '#ff1e27';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-20, GAME_HEIGHT - 40);
    ctx.lineTo(60, GAME_HEIGHT - 290);
    ctx.lineTo(120, GAME_HEIGHT - 40);
    ctx.lineTo(240, GAME_HEIGHT - 240);
    ctx.lineTo(310, GAME_HEIGHT - 40);
    ctx.lineTo(420, GAME_HEIGHT - 310);
    ctx.lineTo(490, GAME_HEIGHT - 40);
    ctx.lineTo(620, GAME_HEIGHT - 220);
    ctx.lineTo(690, GAME_HEIGHT - 340);
    ctx.lineTo(760, GAME_HEIGHT - 40);
    ctx.lineTo(GAME_WIDTH + 20, GAME_HEIGHT - 40);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 20; i++) {
      const spX = (Date.now() / 20 + i * 90) % GAME_WIDTH;
      const spY = (GAME_HEIGHT - 60 - (Date.now() / 15 + i * 65) % 300);
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(spX, spY, 2, 2);
    }
    ctx.restore();

  } else {
    // Sunset Neo-Vibrant Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, COLORS.SKY);
    gradient.addColorStop(0.5, COLORS.SKY_BOTTOM);
    gradient.addColorStop(0.8, '#FF007F'); // Luminous neon pink
    gradient.addColorStop(1, '#00FFF0'); // Glowing cyan at the lower boundary
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Holographic grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < GAME_WIDTH; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GAME_HEIGHT);
      ctx.stroke();
    }

    // Glowing Neon Sun
    ctx.save();
    ctx.shadowColor = '#FF00C1';
    ctx.shadowBlur = 30;
    const sunGrad = ctx.createRadialGradient(GAME_WIDTH - 100, 80, 5, GAME_WIDTH - 100, 80, 45);
    sunGrad.addColorStop(0, '#FFFFFF'); // Warm golden-white core
    sunGrad.addColorStop(0.3, '#FFF700'); // Radiant hot yellow
    sunGrad.addColorStop(1, '#FF1493'); // Electric neon pink corona
    ctx.fillStyle = sunGrad;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(GAME_WIDTH - 100, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Background Hills (Glowing layers!)
    drawCardboardHills(ctx);
  }
}

function drawCardboardHills(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Distant hill: Neon Royal Purple to Hot Pink
    const hill1Grad = ctx.createLinearGradient(0, GAME_HEIGHT - 180, 0, GAME_HEIGHT);
    hill1Grad.addColorStop(0, '#8A2BE2'); // Electric Purple
    hill1Grad.addColorStop(1, '#FF007F'); // Neon Pink
    
    ctx.fillStyle = hill1Grad;
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT - 40);
    ctx.quadraticCurveTo(200, GAME_HEIGHT - 180, 400, GAME_HEIGHT - 60);
    ctx.quadraticCurveTo(600, GAME_HEIGHT - 120, 800, GAME_HEIGHT - 40);
    ctx.lineTo(800, GAME_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT);
    ctx.fill();
    
    ctx.strokeStyle = '#00FFF0'; // Glowing cyan outline
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Closer hill: Deep Indigo to Vivid Turquoise
    const hill2Grad = ctx.createLinearGradient(0, GAME_HEIGHT - 150, 0, GAME_HEIGHT);
    hill2Grad.addColorStop(0, '#4B0082'); // Deep Indigo
    hill2Grad.addColorStop(1, '#00D2D3'); // Bright turquoise
    
    ctx.fillStyle = hill2Grad;
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT - 40);
    ctx.quadraticCurveTo(150, GAME_HEIGHT - 100, 300, GAME_HEIGHT - 40);
    ctx.quadraticCurveTo(500, GAME_HEIGHT - 150, 800, GAME_HEIGHT - 40);
    ctx.lineTo(800, GAME_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT);
    ctx.fill();
    
    ctx.strokeStyle = '#FF00C1'; // Neon pink outline
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
}

export function drawGround(ctx: CanvasRenderingContext2D, scroll: number, theme?: string) {
  ctx.save();
  if (theme === 'CYBER_SPACE') {
    // Cyber metal green matrix plate
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 40, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#021204');
    groundGradient.addColorStop(1, '#09360d');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

    ctx.fillStyle = '#39FF14'; 
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 5);

    ctx.fillStyle = 'rgba(57, 255, 20, 0.7)';
    ctx.font = '8px monospace';
    for (let x = (scroll * -3.2) % 150; x < GAME_WIDTH + 150; x += 150) {
      ctx.fillText('⚡011001101⚡', x, GAME_HEIGHT - 20);
      ctx.fillText('💻 SYSTEM_ONLINE 💻', x + 60, GAME_HEIGHT - 10);
    }

  } else if (theme === 'LAVA_VOLCANO') {
    // Molten lava cracks
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 40, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#1c0303');
    groundGradient.addColorStop(1, '#420606');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

    ctx.fillStyle = '#ff3c00'; 
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 5);

    ctx.fillStyle = '#ffae00';
    for (let x = (scroll * -2.8) % 100; x < GAME_WIDTH + 100; x += 100) {
      ctx.fillRect(x, GAME_HEIGHT - 22, 18, 6);
      ctx.fillRect(x + 50, GAME_HEIGHT - 12, 35, 3);
    }

  } else if (theme === 'ASTRO_NEBULA') {
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 40, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#12042b');
    groundGradient.addColorStop(1, '#2f0857');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

    ctx.fillStyle = '#da70d6'; 
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 5);

    ctx.fillStyle = '#00ffff';
    for (let x = (scroll * -2.2) % 120; x < GAME_WIDTH + 120; x += 120) {
      ctx.beginPath();
      ctx.arc(x, GAME_HEIGHT - 20, 3, 0, Math.PI * 2);
      ctx.arc(x + 60, GAME_HEIGHT - 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (theme === 'HARDCORE_CHAOS') {
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 40, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#0d0001');
    groundGradient.addColorStop(1, '#260105');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

    ctx.fillStyle = '#ff1e27'; 
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 6);

    ctx.fillStyle = '#ffea00';
    for (let x = (scroll * -4.2) % 70; x < GAME_WIDTH + 70; x += 70) {
      ctx.fillRect(x, GAME_HEIGHT - 24, 30, 4);
    }
    ctx.fillStyle = '#ff1e27';
    for (let x = (scroll * -3.8) % 110; x < GAME_WIDTH + 110; x += 110) {
      ctx.fillRect(x + 40, GAME_HEIGHT - 14, 15, 4);
    }

  } else {
    // Synthwave neon details (DEFAULT map)
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 40, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#0F051D');
    groundGradient.addColorStop(1, '#2E0854');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

    // High contrast toxic green cyber boundary
    ctx.fillStyle = '#39FF14'; 
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 5);

    // Rapid scrolling colorful laser speed dashes!
    ctx.fillStyle = '#FF00C1'; 
    for (let x = (scroll * -2.5) % 80; x < GAME_WIDTH + 80; x += 80) {
      ctx.fillRect(x, GAME_HEIGHT - 25, 25, 4);
    }
    ctx.fillStyle = '#00FFF0'; 
    for (let x = (scroll * -1.8) % 120; x < GAME_WIDTH + 120; x += 120) {
      ctx.fillRect(x + 40, GAME_HEIGHT - 15, 8, 4);
    }
  }
  ctx.restore();
}

export function drawCloud(ctx: CanvasRenderingContext2D, cloud: Entity) {
  ctx.save();
  ctx.shadowColor = '#00FFF0'; // Neon cyber cloud aura
  ctx.shadowBlur = 15;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, cloud.width / 2, 0, Math.PI * 2);
  ctx.arc(cloud.x + 20, cloud.y - 10, cloud.width / 2.5, 0, Math.PI * 2);
  ctx.arc(cloud.x - 20, cloud.y - 10, cloud.width / 2.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Sweet neon candy highlight
  ctx.fillStyle = 'rgba(255, 0, 193, 0.2)';
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y + 2, cloud.width / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBull(ctx: CanvasRenderingContext2D, player: Player) {
  // Blinking effect when under invulnerability grace period
  if (player.invulnTimer > 0) {
    if (Math.floor(Date.now() / 65) % 2 === 0) {
      return; // Skip drawing this frame to blink
    }
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.rotation);

  // Boost Aura
  if (player.hasPower) {
    ctx.shadowColor = '#55efc4';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#55efc4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-player.width / 2 - 5, -player.height / 2 - 5, player.width + 10, player.height + 10, 18);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Shield Aura (Electric protective bubble)
  if (player.hasShield) {
    ctx.save();
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(player.width, player.height) / 1.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Double Points Aura (Golden star flares)
  if (player.hasDoublePoints) {
    ctx.save();
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(255, 234, 0, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(player.width, player.height) / 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw based on skin
  if (player.skin === 'PIG') {
    drawPig(ctx, player);
  } else if (player.skin === 'CAT') {
    drawCat(ctx, player);
  } else if (player.skin === 'ROBO') {
    drawRobo(ctx, player);
  } else if (player.skin === 'ALIEN') {
    drawAlien(ctx, player);
  } else if (player.skin === 'DEMON') {
    drawDemon(ctx, player);
  } else if (player.skin === 'CHICKEN') {
    drawChicken(ctx, player);
  } else if (player.skin === 'UNICORN') {
    drawUnicorn(ctx, player);
  } else if (player.skin === 'SHARK') {
    drawShark(ctx, player);
  } else if (player.skin === 'CYBER_PUNK') {
    drawCyberPunk(ctx, player);
  } else if (player.skin === 'MEGA_MECH') {
    drawMegaMech(ctx, player);
  } else if (player.skin === 'SPATIAL_ASTRONAUT') {
    drawSpatialAstronaut(ctx, player);
  } else if (player.skin === 'RAINBOW_NEON') {
    drawRainbowNeon(ctx, player);
  } else if (player.skin === 'SECRET_ZEUS') {
    drawSecretZeus(ctx, player);
  } else {
    drawCow(ctx, player);
  }

  // 6. Rocket (Strapped to back)
  ctx.fillStyle = player.hasPower ? '#00b894' : '#636e72';
  ctx.beginPath();
  ctx.roundRect(-player.width / 1.5, -player.height / 3, player.width / 2.5, player.height / 2, 4);
  ctx.fill();
  ctx.stroke();
  
  // Thrust Flame
  if (player.vy < 0 || player.hasPower) {
    const isBoosted = player.hasPower;
    const flameSize = isBoosted ? 45 : 25;
    const flameColor = isBoosted ? '#00cec9' : '#fab1a0';
    
    ctx.fillStyle = flameColor;
    ctx.shadowColor = flameColor;
    ctx.shadowBlur = isBoosted ? 15 : 0;
    
    ctx.beginPath();
    ctx.moveTo(-player.width / 1.5, -player.height/12);
    ctx.lineTo(-player.width / 1.5 - flameSize, -player.height/12 + (isBoosted ? 12 : 5));
    ctx.lineTo(-player.width / 1.5 - (flameSize - 5), -player.height/12);
    ctx.lineTo(-player.width / 1.5 - flameSize, -player.height/12 - (isBoosted ? 12 : 5));
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawCow(ctx: CanvasRenderingContext2D, player: Player) {
  // Stroke settings for simple, clean cardboard-craft styling
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = player.width;
  const h = player.height;

  // 1. SIMPLE STUMPY LEGS
  const legY = h / 2 - 2;
  const legH = 8;
  const legW = 7;
  
  ctx.fillStyle = '#ffffff';
  // Back leg
  ctx.fillRect(-w / 3, legY, legW, legH);
  ctx.strokeRect(-w / 3, legY, legW, legH);
  // Front leg
  ctx.fillRect(w / 6, legY, legW, legH);
  ctx.strokeRect(w / 6, legY, legW, legH);

  // Black Hooves
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(-w / 3, legY + 5, legW, 3);
  ctx.fillRect(w / 6, legY + 5, legW, 3);

  // 2. MAIN WHITE BODY (Cardboard-style rounded rectangle)
  const bodyGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  if (player.hasPower) {
    bodyGrad.addColorStop(0, '#55efc4');
    bodyGrad.addColorStop(1, '#00b894');
  } else if (player.skin === 'GOLDEN') {
    bodyGrad.addColorStop(0, '#ffeaa7');
    bodyGrad.addColorStop(0.5, '#f1c40f');
    bodyGrad.addColorStop(1, '#e67e22');
  } else if (player.skin === 'FIRE') {
    bodyGrad.addColorStop(0, '#2d3436');
    bodyGrad.addColorStop(0.6, '#1e272e');
    bodyGrad.addColorStop(1, '#ff3008');
  } else {
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(1, '#f1ede9');
  }

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 10);
  ctx.fill();
  ctx.stroke();

  // 3. CLASSIC COW PATCH SPOTS (Bold circular spots)
  ctx.fillStyle = player.skin === 'GOLDEN' ? '#ffffff' : (player.skin === 'FIRE' ? '#ff9f43' : '#2d3436');
  
  ctx.beginPath();
  ctx.arc(-w / 3.5, -h / 6, 8, 0, Math.PI * 2);
  ctx.arc(-w / 12, h / 6, 6, 0, Math.PI * 2);
  ctx.arc(w / 5, -h / 4, 5, 0, Math.PI * 2);
  ctx.fill();

  // 4. CLASSIC MINI HORNS ON TOP
  if (player.skin !== 'COOL') {
    ctx.fillStyle = player.skin === 'GOLDEN' ? '#ffffff' : (player.skin === 'FIRE' ? '#ffa502' : '#ffeaa7');
    
    // Left Horn
    ctx.beginPath();
    ctx.moveTo(-w / 4, -h / 2 + 2);
    ctx.lineTo(-w / 4 - 4, -h / 2 - 8);
    ctx.lineTo(-w / 4 + 4, -h / 2 + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Horn
    ctx.beginPath();
    ctx.moveTo(w / 12, -h / 2 + 2);
    ctx.lineTo(w / 12 + 4, -h / 2 - 8);
    ctx.lineTo(w / 12 + 8, -h / 2 + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 5. CUTE CARTOON PINK SNOUT OVAL
  const muzzleW = w / 2.7;
  const muzzleH = h / 2.3;
  const muzzleX = w / 6;
  const muzzleY = -h / 12;

  ctx.fillStyle = player.skin === 'GOLDEN' ? '#e67e22' : (player.skin === 'FIRE' ? '#353b48' : '#ffb8b8');
  ctx.beginPath();
  ctx.roundRect(muzzleX, muzzleY, muzzleW, muzzleH, 8);
  ctx.fill();
  ctx.stroke();

  // Nostril dots
  ctx.fillStyle = player.skin === 'FIRE' ? '#ff3008' : '#d63031';
  ctx.beginPath();
  ctx.arc(muzzleX + muzzleW * 0.35, muzzleY + muzzleH * 0.45, 1.8, 0, Math.PI * 2);
  ctx.arc(muzzleX + muzzleW * 0.70, muzzleY + muzzleH * 0.45, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Smile
  ctx.strokeStyle = player.skin === 'FIRE' ? '#ff3008' : '#d63031';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(muzzleX + muzzleW * 0.52, muzzleY + muzzleH * 0.6, 3.5, 0, Math.PI);
  ctx.stroke();

  // 6. EXPRESSIVE GLASSY LARGE EYE
  const eyeSize = 9;
  const eyeX = w / 4;
  const eyeY = -h / 4;

  ctx.fillStyle = player.skin === 'FIRE' ? '#1e272e' : '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big Pupil looking forward
  ctx.fillStyle = player.skin === 'FIRE' ? '#ff3008' : '#2d3436';
  ctx.beginPath();
  ctx.arc(eyeX + 1.2, eyeY, 5.2, 0, Math.PI * 2);
  ctx.fill();

  // Glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eyeX + 2.5, eyeY - 2, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Cheek blush
  ctx.fillStyle = 'rgba(255, 118, 117, 0.4)';
  ctx.beginPath();
  ctx.arc(eyeX - 4, eyeY + 9, 3, 0, Math.PI * 2);
  ctx.fill();

  // 7. SIMPLE EAR FLAPS
  ctx.fillStyle = player.hasPower ? '#55efc4' : (player.skin === 'GOLDEN' ? '#f1c40f' : (player.skin === 'FIRE' ? '#1e272e' : '#ffffff'));
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-w / 3.2, -h / 3.5, 4, 7, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 8. SUNGLASSES OVERLAY IF COOL
  if (player.skin === 'COOL') {
    drawSunglasses(ctx, player);
  }
}

function drawPig(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#c44569';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#f8a5c2';
  ctx.beginPath();
  ctx.roundRect(-player.width / 2, -player.height / 2, player.width, player.height, 20);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#f78fb3';
  ctx.beginPath();
  ctx.roundRect(player.width/6, -player.height/10, player.width/2.5, player.height/3, 10);
  ctx.fill();
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = '#c44569';
  ctx.beginPath();
  ctx.arc(player.width/2.5, 0, 3, 0, Math.PI * 2);
  ctx.arc(player.width/2, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(player.width / 8, -player.height / 4, 5, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#f8a5c2';
  ctx.beginPath();
  ctx.moveTo(-player.width/3, -player.height/2);
  ctx.lineTo(-player.width/2, -player.height/2 - 10);
  ctx.lineTo(-player.width/4, -player.height/2);
  ctx.fill();
  ctx.stroke();
}

function drawCat(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#fab1a0';
  ctx.beginPath();
  ctx.roundRect(-player.width / 2, -player.height / 2, player.width, player.height, 10);
  ctx.fill();
  ctx.stroke();

  // White patches
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.width/4, player.height/4, 10, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#55efc4';
  ctx.beginPath();
  ctx.arc(player.width / 4, -player.height / 4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'black';
  ctx.fillRect(player.width/4 - 1, -player.height/4 - 4, 2, 8);

  // Ears
  ctx.fillStyle = '#fab1a0';
  ctx.beginPath();
  ctx.moveTo(-player.width/2, -player.height/2);
  ctx.lineTo(-player.width/2, -player.height/2 - 15);
  ctx.lineTo(-player.width/3, -player.height/2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(player.width/4, -player.height/2);
  ctx.lineTo(player.width/4 + 10, -player.height/2 - 15);
  ctx.lineTo(player.width/2.5, -player.height/2);
  ctx.fill();
  ctx.stroke();
}

function drawSunglasses(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.fillStyle = '#0a0a0a';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  const glassY = -player.height / 4 - 6;
  ctx.beginPath();
  ctx.roundRect(player.width/12, glassY, 14, 10, 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(player.width/4 + 6, glassY, 10, 10, 2);
  ctx.fill();
  ctx.stroke();
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  if (obs.variant === 'bomb') {
    drawEnergyBomb(ctx, obs);
    return;
  }

  if (obs.variation === 1) {
    drawCactus(ctx, obs);
    return;
  }
  
  if (obs.variation === 2) {
    // Flappy King's Golden Royal Egg projectile
    ctx.save();
    ctx.translate(obs.x, obs.y);
    
    // Golden egg body
    const eggGrad = ctx.createRadialGradient(-2, -3, 2, 0, 0, obs.width / 1.5);
    eggGrad.addColorStop(0, '#ffeaa7'); // bright center
    eggGrad.addColorStop(0.7, '#fdcb6e');
    eggGrad.addColorStop(1, '#e17055');
    
    ctx.fillStyle = eggGrad;
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2.5;
    
    ctx.beginPath();
    // Egg shape
    ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Royal spark patterns on egg
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -obs.height / 3);
    ctx.lineTo(0, obs.height / 3);
    ctx.moveTo(-obs.width / 4, 0);
    ctx.lineTo(obs.width / 4, 0);
    ctx.stroke();
    
    ctx.restore();
    return;
  }
  
  if (obs.variation === 3) {
    // Space Invader's Neon Plasma Laser Bolt
    ctx.save();
    ctx.translate(obs.x, obs.y);
    
    // Neon outer glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff007f';
    
    // Laser bolt capsule
    ctx.fillStyle = '#ff007f';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 4);
    ctx.fill();
    ctx.stroke();
    
    // Internal bright white core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-obs.width / 4, -obs.height / 2 + 3, obs.width / 2, obs.height - 6);
    
    ctx.restore();
    return;
  }

  const isTop = obs.y < GAME_HEIGHT / 2;

  ctx.save();
  ctx.translate(obs.x, obs.y);

  if (!isTop) {
    // --- HIGH-VOLTAGE POWER PYLON / TOWER (Torre de alta tensión abajo) ---
    // A highly detailed retro-aviation warning style steel truss tower.
    const w = obs.width;
    const h = obs.height;

    // 1. Steel structure base / outline settings
    ctx.strokeStyle = '#2d3436'; // Bold outline
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Gradients for steel posts
    const steelGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    steelGrad.addColorStop(0, '#4b5563'); // Dark gray metal
    steelGrad.addColorStop(0.4, '#d1d5db'); // Sleek metal sheen
    steelGrad.addColorStop(0.6, '#ffffff'); // Bright center highlight
    steelGrad.addColorStop(1, '#4b5563');

    ctx.fillStyle = steelGrad;

    // 2. Draw Main Diagonal Steel Pillars (Tapering from bottom to top)
    ctx.beginPath();
    // Left diagonal post
    ctx.moveTo(-w / 2.3, h / 2);
    ctx.lineTo(-w / 5.5, -h / 2);
    // Right diagonal post
    ctx.moveTo(w / 2.3, h / 2);
    ctx.lineTo(w / 5.5, -h / 2);
    ctx.stroke();

    // 3. Draw horizontal steel girders (latticework bars)
    const steps = 4;
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0 is top, 1 is bottom
      const currY = -h / 2 + t * h;
      const currW = (w / 5.5) + t * (w / 2.3 - w / 5.5);
      
      ctx.beginPath();
      ctx.moveTo(-currW, currY);
      ctx.lineTo(currW, currY);
      ctx.stroke();
    }

    // 4. Draw diagonal cross truss beams (X girders configuration)
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#374151'; // Dark metallic gray for smaller beams
    for (let i = 0; i < steps; i++) {
      const y1 = -h / 2 + (i / steps) * h;
      const y2 = -h / 2 + ((i + 1) / steps) * h;
      const w1 = (w / 5.5) + (i / steps) * (w / 2.3 - w / 5.5);
      const w2 = (w / 5.5) + ((i + 1) / steps) * (w / 2.3 - w / 5.5);
      
      ctx.beginPath();
      ctx.moveTo(-w1, y1);
      ctx.lineTo(w2, y2);
      ctx.moveTo(w1, y1);
      ctx.lineTo(-w2, y2);
      ctx.stroke();
    }

    // 5. Huge horizontal power transmission cross-arms
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3;
    
    // Level 1 Upper Cross-Arm
    const arm1Y = -h / 2 + 0.3 * h;
    const arm1HalfW = w / 2 + 10;
    ctx.fillStyle = steelGrad;
    ctx.beginPath();
    ctx.rect(-arm1HalfW, arm1Y - 4, arm1HalfW * 2, 8);
    ctx.fill();
    ctx.stroke();

    // Level 2 Lower Cross-Arm
    const arm2Y = -h / 2 + 0.62 * h;
    const arm2HalfW = w / 2 + 2;
    ctx.beginPath();
    ctx.rect(-arm2HalfW, arm2Y - 4, arm2HalfW * 2, 8);
    ctx.fill();
    ctx.stroke();

    // 6. Dangling glass and ceramic insulator string bells
    const drawInsulator = (insY: number, insX: number) => {
      ctx.save();
      ctx.fillStyle = '#00f0ff'; // glowing sci-fi insulating glass blue
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 4;
      
      // Stack of 3 insulator disks
      for (let d = 0; d < 3; d++) {
        const diskY = insY + d * 6;
        ctx.beginPath();
        ctx.ellipse(insX, diskY, 5 - d, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // Glowing live transmission cord connector
      ctx.strokeStyle = '#ff9f43';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(insX, insY + 14);
      ctx.quadraticCurveTo(insX + (Math.random() > 0.5 ? 4 : -4), insY + 22, insX, insY + 26);
      ctx.stroke();
      ctx.restore();
    };

    drawInsulator(arm1Y + 4, -arm1HalfW + 3);
    drawInsulator(arm1Y + 4, arm1HalfW - 3);
    drawInsulator(arm2Y + 4, -arm2HalfW + 3);
    drawInsulator(arm2Y + 4, arm2HalfW - 3);

    // 7. Glowing hazard/radiation warning label (Plate in center)
    const plateY = -h / 2 + 0.44 * h;
    ctx.fillStyle = '#f6e58d'; // warning yellow tile
    ctx.strokeStyle = '#1e272e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-15, plateY - 8, 30, 16, 3);
    ctx.fill();
    ctx.stroke();

    // Miniature warning lightning symbol inside plate
    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.moveTo(-1, plateY - 5);
    ctx.lineTo(4, plateY - 1);
    ctx.lineTo(0, plateY - 1);
    ctx.lineTo(2, plateY + 5);
    ctx.lineTo(-3, plateY + 1);
    ctx.lineTo(1, plateY + 1);
    ctx.closePath();
    ctx.fill();

    // 8. Blinking red beacon safety light (Top obstruction indicator)
    const isBeaconOn = Math.floor(Date.now() / 350) % 2 === 0;
    const topX = 0;
    const topY = -h / 2 - 3;
    
    // Small steel beacon mounting rod
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 35;
    ctx.beginPath();
    ctx.moveTo(topX, -h / 2);
    ctx.lineTo(topX, topY);
    ctx.stroke();

    if (isBeaconOn) {
      ctx.save();
      ctx.shadowColor = '#ff2a2a';
      ctx.shadowBlur = 12;
      
      const blinkGrad = ctx.createRadialGradient(topX, topY, 1, topX, topY, 10);
      blinkGrad.addColorStop(0, '#ffffff'); // Pure blinding white core
      blinkGrad.addColorStop(0.3, '#ff2222'); // Saturated ruby red
      blinkGrad.addColorStop(1, 'rgba(255, 34, 34, 0)');
      
      ctx.fillStyle = blinkGrad;
      ctx.beginPath();
      ctx.arc(topX, topY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = '#7f1d1d'; // offline dark oxide red
      ctx.beginPath();
      ctx.arc(topX, topY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    // --- HIGH-FIDELITY AIRPLANE WING/TAIL FIN (Aleta de avión arriba) ---
    // A beautiful tapered swept-back aircraft vertical wing / stabilizer piece.
    const w = obs.width;
    const h = obs.height;

    // Wing gradient mimicking reflective commercial fuselage aluminum
    const wingGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    wingGrad.addColorStop(0, '#475569'); // dark slate wing trailing shadow
    wingGrad.addColorStop(0.3, '#cbd5e1'); // pristine plane alloy base
    wingGrad.addColorStop(0.75, '#f8fafc'); // bright structural sun glare
    wingGrad.addColorStop(1, '#94a3b8');   // leading edge aerodynamic alloy

    // Sweep profile definitions:
    // Standard flights go right, obstacle spawns and heads left.
    // Leading aerodynamic edge is on the right side.
    const xTopLeft = -w / 2.2;
    const xTopRight = w / 2;
    const xBottomLeft = -w / 6;
    const xBottomRight = w / 4.5;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = wingGrad;

    // 1. Draw Aerodynamic Wing Shape
    ctx.beginPath();
    ctx.moveTo(xTopLeft, -h / 2);
    ctx.lineTo(xTopRight, -h / 2); // Connects to airplane ceiling
    ctx.lineTo(xBottomRight, h / 2 - 8); // Tapers down to winglet tip
    
    // Elegant upward curved winglet tip outline at bottom
    ctx.quadraticCurveTo(xBottomRight + 8, h / 2 + 1, xBottomRight - 4, h / 2);
    ctx.quadraticCurveTo(xBottomLeft - 2, h / 2 - 2, xBottomLeft, h / 2 - 10);
    
    ctx.lineTo(xTopLeft, -h / 2); // Return to upper bounds
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Structural Panel Lines / Rivet Joints
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1.5;

    // Drawing vertical flight panels
    const drawPanelLine = (ratio: number) => {
      const topX = xTopLeft + (xTopRight - xTopLeft) * ratio;
      const botX = xBottomLeft + (xBottomRight - xBottomLeft) * ratio;
      ctx.beginPath();
      ctx.moveTo(topX, -h / 2 + 5);
      ctx.lineTo(botX, h / 2 - 12);
      ctx.stroke();

      // Tiny aircraft rivet details along lines
      ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
      for (let r = 1; r < 5; r++) {
        const pct = r / 5;
        const rx = topX + (botX - topX) * pct;
        const ry = -h / 2 + 5 + (h - 17) * pct;
        ctx.beginPath();
        ctx.arc(rx, ry, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawPanelLine(0.35);
    drawPanelLine(0.7);

    // 3. Airline Decal/Speed-Stripes
    // Let's paint beautiful jetliner speed stripes across the middle region of the fin.
    ctx.fillStyle = '#ef4444'; // Radiant Red Airline brand
    ctx.beginPath();
    ctx.moveTo(xTopLeft + (xTopRight - xTopLeft) * 0.2, -h / 8);
    ctx.lineTo(xTopLeft + (xTopRight - xTopLeft) * 0.8, -h / 8);
    ctx.lineTo(xBottomLeft + (xBottomRight - xBottomLeft) * 0.8, -h * 0.05);
    ctx.lineTo(xBottomLeft + (xBottomRight - xBottomLeft) * 0.2, -h * 0.05);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3b82f6'; // Clean Aerospace Blue
    ctx.beginPath();
    ctx.moveTo(xTopLeft + (xTopRight - xTopLeft) * 0.15, -h * 0.02);
    ctx.lineTo(xTopLeft + (xTopRight - xTopLeft) * 0.75, -h * 0.02);
    ctx.lineTo(xBottomLeft + (xBottomRight - xBottomLeft) * 0.75, h / 12);
    ctx.lineTo(xBottomLeft + (xBottomRight - xBottomLeft) * 0.15, h / 12);
    ctx.closePath();
    ctx.fill();

    // 4. Navigation/Strobe Light (Green at the wing tip representing Right navigation safety)
    const isWingStrobeLit = Math.floor(Date.now() / 450) % 2 === 0;
    const lightX = xBottomRight - 1;
    const lightY = h / 2 - 6;

    if (isWingStrobeLit) {
      ctx.save();
      ctx.shadowColor = '#10b981'; // Blinking Emerald Green
      ctx.shadowBlur = 10;
      
      const fireGrad = ctx.createRadialGradient(lightX, lightY, 1, lightX, lightY, 8);
      fireGrad.addColorStop(0, '#ffffff'); // Pure intensity
      fireGrad.addColorStop(0.3, '#10b981'); // Emerald green
      fireGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(lightX, lightY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = '#064e3b'; // Unlit green bulb
      ctx.beginPath();
      ctx.arc(lightX, lightY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawBird(ctx: CanvasRenderingContext2D, bird: Obstacle) {
  const variant = bird.variant || 'yellow';
  ctx.save();
  ctx.translate(bird.x, bird.y);

  // Hover/flapping oscillation for game dynamics
  const flapping = Math.sin(Date.now() / 65);
  const flapScale = Math.abs(5 + flapping * 7) + 1.5;

  if (variant === 'kamikaze') {
    drawKamikazeBird(ctx, bird, flapping, flapScale);
  } else if (variant === 'grenadier') {
    drawGrenadierBird(ctx, bird, flapping, flapScale);
  } else if (variant === 'ninja') {
    // Sneaky black cyber ninja bird with red headband
    ctx.shadowColor = '#ff2a2a';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#1e1e24'; // Matte black shadow
    ctx.strokeStyle = '#ff3838'; // Cyber Red glow borders
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red ninja mask slit
    ctx.fillStyle = '#ff2a2a';
    ctx.fillRect(-bird.width / 2 + 3, -5, bird.width - 6, 10);

    // Glowing white stealth eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -1, 3.5, 0, Math.PI * 2);
    ctx.arc(3, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Black pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-7, -1, 1.8, 0, Math.PI * 2);
    ctx.arc(2, -1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Mask fabric ties flapping behind
    ctx.fillStyle = '#ff2a2a';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2 - 2, -2);
    ctx.lineTo(bird.width / 2 + 12, -8 + flapping * 3);
    ctx.lineTo(bird.width / 2 + 14, -2 + flapping * 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } 
  else if (variant === 'fire-bat') {
    // Glowing radioactive fire bat
    ctx.shadowColor = '#ff9f43';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff3838'; 
    ctx.strokeStyle = '#feca57'; // Yellow gold borders
    ctx.lineWidth = 2.5;

    // Bat body
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pointy ears
    ctx.fillStyle = '#d63031';
    ctx.beginPath();
    ctx.moveTo(-11, -bird.height / 2);
    ctx.lineTo(-15, -bird.height / 2 - 9);
    ctx.lineTo(-5, -bird.height / 3);
    ctx.moveTo(11, -bird.height / 2);
    ctx.lineTo(15, -bird.height / 2 - 9);
    ctx.lineTo(5, -bird.height / 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Angry fire eyes
    ctx.fillStyle = '#fffa65';
    ctx.beginPath();
    ctx.ellipse(-7, -3, 5, 2.5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(3, -3, 5, 2.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Vampire fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-8, 3);
    ctx.lineTo(-6, 9);
    ctx.lineTo(-4, 3);
    ctx.moveTo(2, 3);
    ctx.lineTo(4, 9);
    ctx.lineTo(6, 3);
    ctx.closePath();
    ctx.fill();
  } 
  else if (variant === 'ghost') {
    // Spooky translucent glowing ghost
    ctx.save();
    ctx.globalAlpha = 0.65 + Math.sin(Date.now() / 150) * 0.15; // pulsating ghost alpha!
    ctx.shadowColor = '#00FFF0';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#e0fcfc';
    ctx.strokeStyle = '#00fff0';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.ellipse(0, -2, bird.width / 2.1, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Floating double tail sheets on the right
    ctx.beginPath();
    ctx.moveTo(bird.width / 2 - 4, 3);
    ctx.quadraticCurveTo(bird.width / 2 + 12, -7 + flapping * 4, bird.width / 2 + 16, 2);
    ctx.quadraticCurveTo(bird.width / 2 + 10, 11 + flapping * 4, bird.width / 2 - 4, 7);
    ctx.fill();
    ctx.stroke();

    // Haunting hollow eyes
    ctx.fillStyle = '#100c24';
    ctx.beginPath();
    ctx.arc(-7, -3, 4.5, 0, Math.PI * 2);
    ctx.arc(3, -3, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00fff0';
    ctx.beginPath();
    ctx.arc(-7, -3, 1.5, 0, Math.PI * 2);
    ctx.arc(3, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } 
  else if (variant === 'robo-copter') {
    // Futuristic cybernetic quadcopter bird
    ctx.shadowColor = '#00FFCC';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#57606f'; // Metallic gray
    ctx.strokeStyle = '#00fff0'; // Cyan trim
    ctx.lineWidth = 2.5;

    // Oval mechanical fuselage
    ctx.beginPath();
    ctx.ellipse(0, 2, bird.width / 1.7, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Copter shaft and spinning rotor blades
    ctx.strokeStyle = '#747d8c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -bird.height/2 + 2);
    ctx.lineTo(0, -bird.height/2 - 6);
    ctx.stroke();

    // Blades spinning
    const rotorAngle = (Date.now() / 15); // very fast rotation speed
    ctx.save();
    ctx.translate(0, -bird.height/2 - 6);
    ctx.rotate(rotorAngle);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(22, 0);
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 4);
    ctx.stroke();
    ctx.restore();

    // Glowing electric scanning visor
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(-bird.width / 2.2, -1, bird.width / 1.3, 5);
    
    // Visor scan dot
    const scanX = Math.sin(Date.now() / 100) * 8;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6 + scanX, -1, 4, 5);
  } 
  else {
    // --- Yellow and Cool birds ---
    const isCool = variant === 'cool';
    
    ctx.fillStyle = isCool ? '#ff9f43' : '#ffd32c'; // bright neon orange / bright golden yellow
    ctx.strokeStyle = '#1e272e';
    ctx.lineWidth = 2.5;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff8203'; // Pointy neon orange beak
    ctx.beginPath();
    ctx.moveTo(-bird.width / 2 + 3, -6);
    ctx.lineTo(-bird.width / 2 - 14, 0);
    ctx.lineTo(-bird.width / 2 + 3, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-bird.width / 2 + 3, 0);
    ctx.lineTo(-bird.width / 2 - 14, 0);
    ctx.stroke();

    const eyeX = -bird.width / 5;
    const eyeY = -bird.height / 5;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(eyeX - 2.5, eyeY, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX - 3.5, eyeY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    if (isCool) {
      ctx.fillStyle = '#1e272e';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.roundRect(eyeX - 7, eyeY - 4, 15, 8, 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(eyeX - 4, eyeY - 2);
      ctx.lineTo(eyeX + 3, eyeY + 2);
      ctx.stroke();
    }
  }

  // Back wings flapping - Rendered in custom theme styles
  if (variant === 'yellow' || variant === 'cool') {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(bird.width / 6, 1, 7, flapScale, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (variant === 'ninja') {
    ctx.fillStyle = '#1e1e24';
    ctx.strokeStyle = '#ff3838';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bird.width / 6, 1, 6, flapScale * 0.8, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (variant === 'fire-bat') {
    ctx.fillStyle = '#ffd32c'; // flaming primary wing
    ctx.strokeStyle = '#ff3838';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bird.width / 5, -3, 9, flapScale * 1.2, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export function drawPowerUp(ctx: CanvasRenderingContext2D, p: Entity) {
  // Shield Boost
  if (p.type === 'powerup_shield') {
     ctx.save();
     ctx.translate(p.x, p.y);
     ctx.shadowColor = '#00fff0';
     ctx.shadowBlur = 15;
     ctx.fillStyle = '#0984e3';
     ctx.strokeStyle = '#74b9ff';
     ctx.lineWidth = 2.5;
     ctx.beginPath();
     ctx.arc(0, 0, 14, 0, Math.PI * 2);
     ctx.fill();
     ctx.stroke();
     // Shield crest symbol
     ctx.fillStyle = '#ffffff';
     ctx.beginPath();
     ctx.moveTo(-5, -6);
     ctx.lineTo(5, -6);
     ctx.lineTo(5, 0);
     ctx.quadraticCurveTo(0, 7, -5, 0);
     ctx.closePath();
     ctx.fill();
     ctx.restore();
     return;
  }

  // Double Points Boost
  if (p.type === 'powerup_double') {
     ctx.save();
     ctx.translate(p.x, p.y);
     ctx.shadowColor = '#ffd700';
     ctx.shadowBlur = 15;
     ctx.fillStyle = '#fdcb6e';
     ctx.strokeStyle = '#ffeaa7';
     ctx.lineWidth = 2.5;
     
     // Draw a beautiful star/diamond
     ctx.beginPath();
     ctx.moveTo(0, -14);
     ctx.lineTo(11, 0);
     ctx.lineTo(0, 14);
     ctx.lineTo(-11, 0);
     ctx.closePath();
     ctx.fill();
     ctx.stroke();

     // Draw "2x" Label
     ctx.fillStyle = '#000000';
     ctx.font = 'bold 8.5px sans-serif';
     ctx.textAlign = 'center';
     ctx.textBaseline = 'middle';
     ctx.fillText('2X', 0.5, 0.5);
     ctx.restore();
     return;
  }

  ctx.save();
  ctx.translate(p.x, p.y);
  
  // Arrow pointing right (towards the bird side)
  // Removed rotation so it naturally faces towards the right where birds enter from
  ctx.rotate(0); 

  // Super hot fire orange/red glowing aura
  ctx.shadowColor = '#ff3d00';
  ctx.shadowBlur = 24;
  
  const time = Date.now() * 0.015;

  // Set additive compositing for intense, bright, hyper-realistic fire overlaps
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // 1. Drawing a dense, surrounding fire shroud around the entire arrow boundary
  // We define key coordinates along the arrow silhouette to grow flames from
  const flameOrigins = [
    { x: -15, y: -8 }, { x: -15, y: 0 }, { x: -15, y: 8 }, // back tail
    { x: -5, y: -10 }, { x: 5, y: -15 }, // top-edge
    { x: 14, y: -6 }, { x: 22, y: 0 }, { x: 14, y: 6 }, // front tip
    { x: 5, y: 15 }, { x: -5, y: 10 } // bottom-edge
  ];

  flameOrigins.forEach((origin, idx) => {
    // Unique wave parameters per flame origin
    const offsetTime = time + idx * 1.7;
    const flameAngle = Math.atan2(origin.y, origin.x) + Math.sin(offsetTime * 0.8) * 0.2;
    // Length of the flame tongue
    const len = 15 + Math.sin(offsetTime * 1.5) * 9;
    // Width of the flame tongue base
    const baseW = 6 + Math.cos(offsetTime) * 2;

    // Direction the flame blows (mostly backwards/leftwards to simulate moving right at high speed)
    const blowAngle = Math.PI + (Math.sin(offsetTime * 1.2) * 0.25 - 0.1); 

    // Target flame point
    const targetX = origin.x + Math.cos(blowAngle) * len;
    const targetY = origin.y + Math.sin(blowAngle) * len;

    // Control point for curved organic flame shape
    const ctrlX = origin.x + Math.cos(blowAngle + 0.5) * (len * 0.5);
    const ctrlY = origin.y + Math.sin(blowAngle + 0.5) * (len * 0.5);

    // Create a magnificent radial or linear gradient for each flame tongue
    const fGrad = ctx.createRadialGradient(origin.x, origin.y, 2, origin.x, origin.y, len);
    fGrad.addColorStop(0, '#ffffff');       // White hot center
    fGrad.addColorStop(0.2, '#ffea00');     // Yellow heat
    fGrad.addColorStop(0.5, '#ff6a00');     // Intense orange
    fGrad.addColorStop(0.8, '#ff1a00');     // Fire red outline
    fGrad.addColorStop(1, 'rgba(255, 26, 0, 0)'); // Dissolves

    ctx.fillStyle = fGrad;
    ctx.beginPath();
    // Start at base left corner
    ctx.moveTo(origin.x - Math.sin(blowAngle) * baseW, origin.y + Math.cos(blowAngle) * baseW);
    // Curve to flame tip
    ctx.quadraticCurveTo(ctrlX, ctrlY, targetX, targetY);
    // Curve back to base right corner
    ctx.quadraticCurveTo(ctrlX - Math.sin(blowAngle) * 2, ctrlY + Math.cos(blowAngle) * 2, origin.x + Math.sin(blowAngle) * baseW, origin.y - Math.cos(blowAngle) * baseW);
    ctx.closePath();
    ctx.fill();
  });

  // 2. Extra Ember Sparks floating and spiraling off the burning arrow
  const numSparks = 8;
  for (let s = 0; s < numSparks; s++) {
    const sparkTime = time + s * 7.7;
    // Sparks flow backwards (to the left) from various points
    const startX = -15 + (s * 4);
    const sparkX = startX - ((sparkTime * 6) % 35);
    const sparkY = Math.sin(sparkTime) * 16 + (Math.cos(sparkTime * 0.5) * 8);
    const sparkSize = 1.0 + (Math.sin(sparkTime * 3) + 1) * 1.2;
    
    // Spark color shifts dynamically as it cools down
    const coolFactor = Math.abs(sparkX - startX) / 35; // 0 (hot) to 1 (cool)
    ctx.fillStyle = coolFactor < 0.4 ? '#ffffff' : (coolFactor < 0.75 ? '#ffea00' : '#ff3d00');
    
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Restore compound operation to normal for drawing the physical arrow structure
  ctx.restore();

  // 3. Fire Gradient for Arrow Body
  const fireGrad = ctx.createLinearGradient(-15, 0, 22, 0);
  fireGrad.addColorStop(0, '#ff3d00'); // Deep glowing red-orange at tail
  fireGrad.addColorStop(0.4, '#ff9100'); // Hot orange
  fireGrad.addColorStop(0.85, '#ffea00'); // Incandescent yellow
  fireGrad.addColorStop(1, '#ffffff'); // Searing white hot arrow tip
  
  ctx.fillStyle = fireGrad;
  ctx.strokeStyle = '#d63031';
  ctx.lineWidth = 2.5;
  
  // Draw Arrow Outer Body
  ctx.beginPath();
  ctx.moveTo(-15, -10);
  ctx.lineTo(5, -10);
  ctx.lineTo(5, -20);
  ctx.lineTo(22, 0);
  ctx.lineTo(5, 20);
  ctx.lineTo(5, 10);
  ctx.lineTo(-15, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // 4. White/Golden Burning core of the Arrow
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-11, -5);
  ctx.lineTo(3, -5);
  ctx.lineTo(3, -11);
  ctx.lineTo(15, 0);
  ctx.lineTo(3, 11);
  ctx.lineTo(3, 5);
  ctx.lineTo(-11, 5);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const alpha = p.life / p.maxLife;
  ctx.fillStyle = p.color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss) {
  if (boss.state === 'defeated') return;

  ctx.save();
  ctx.translate(boss.x, boss.y);

  const w = boss.width;
  const h = boss.height;

  // Blinking effect when taking damage
  const isBlinking = Math.floor(Date.now() / 100) % 2 === 0;
  const hpPercent = boss.hp / boss.maxHp;

  if (boss.id === 'flappy-king-boss') {
    // --- LEVEL 40: THE RETRO FLAPPY KING BIRD BOSS ---
    // Wing flap animation frame calculation
    const flapY = Math.sin(Date.now() / 60) * 14;

    // Fat bird body (golden-yellow)
    ctx.fillStyle = (boss.hp < boss.maxHp && isBlinking) ? '#ff7675' : '#fed330';
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3.5;
    
    ctx.beginPath();
    ctx.arc(0, 0, w / 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Giant comical white eyeballs with tiny black pupils
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 7, -h / 6, h / 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(w / 7 + 2, -h / 6, h / 11, 0, Math.PI * 2);
    ctx.fill();

    // Giant comical orange beak
    ctx.fillStyle = '#fe8204';
    ctx.beginPath();
    ctx.moveTo(w / 4.5, -h / 12);
    ctx.lineTo(w / 1.3, h / 18);
    ctx.lineTo(w / 4.5, h / 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Secondary wing overlay with animated flap
    ctx.fillStyle = (boss.hp < boss.maxHp && isBlinking) ? '#ff7675' : '#fe9814';
    ctx.beginPath();
    ctx.ellipse(-w / 4, flapY / 2.5, w / 4.5, h / 3.2, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Royal Golden Crown with Ruby Gems resting on head
    ctx.fillStyle = '#f5b041';
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-w / 4, -h / 2.4);
    ctx.lineTo(-w / 4 - 4, -h / 2.4 - 18); // Left peak
    ctx.lineTo(-w / 12, -h / 2.4 - 8);
    ctx.lineTo(0, -h / 2.4 - 24); // High center peak
    ctx.lineTo(w / 12, -h / 2.4 - 8);
    ctx.lineTo(w / 4 + 4, -h / 2.4 - 18); // Right peak
    ctx.lineTo(w / 4, -h / 2.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tiny ruby gem overlays
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(-w/4 - 4, -h/2.4 - 19, 2.5, 0, Math.PI * 2);
    ctx.arc(0, -h/2.4 - 25, 3, 0, Math.PI * 2);
    ctx.arc(w/4 + 4, -h/2.4 - 19, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (boss.id === 'astro-invader-boss') {
    // --- LEVEL 60: THE ASTRO-MEGADON SPACE INVADER ---
    // Outer retro glow
    ctx.shadowBlur = 18;
    ctx.shadowColor = (boss.hp < boss.maxHp && isBlinking) ? '#ff4757' : '#ff007f';
    
    // Pixel invader core block body (Glowing neon magenta)
    ctx.fillStyle = (boss.hp < boss.maxHp && isBlinking) ? '#ff7675' : '#ff007f';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;

    // Body base
    ctx.fillRect(-w / 2.2, -h / 3, w / 1.1, h / 1.5);
    ctx.strokeRect(-w / 2.2, -h / 3, w / 1.1, h / 1.5);

    // Double Crab Antenna ears
    ctx.fillRect(-w/3.5, -h/2.1, 12, h/4);
    ctx.strokeRect(-w/3.5, -h/2.1, 12, h/4);
    ctx.fillRect(w/3.5 - 12, -h/2.1, 12, h/4);
    ctx.strokeRect(w/3.5 - 12, -h/2.1, 12, h/4);

    ctx.fillRect(-w/3.5 - 4, -h/2.1 - 4, 20, 8);
    ctx.fillRect(w/3.5 - 16, -h/2.1 - 4, 20, 8);

    // Flashing neon blue pixel eyes
    ctx.shadowBlur = 0; // stop shadow inside body
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-w/3.8, -h/8, 15, 15);
    ctx.fillRect(w/3.8 - 15, -h/8, 15, 15);

    // Swapping invader legs animation
    const invFrame = Math.floor(Date.now() / 200) % 2 === 0;
    ctx.fillStyle = (boss.hp < boss.maxHp && isBlinking) ? '#ff7675' : '#ff007f';
    
    if (invFrame) {
      // Frame A: legs down and straight
      ctx.fillRect(-w/2.4, h/3 - 2, 14, h/4);
      ctx.fillRect(-w/6, h/3 - 2, 12, h/4);
      ctx.fillRect(w/6 - 12, h/3 - 2, 12, h/4);
      ctx.fillRect(w/2.4 - 14, h/3 - 2, 14, h/4);
    } else {
      // Frame B: legs spread outward diagonally
      ctx.fillRect(-w/2.4 - 6, h/3 - 2, 14, h/5);
      ctx.fillRect(-w/6, h/3 - 2, 12, h/4);
      ctx.fillRect(w/6 - 12, h/3 - 2, 12, h/4);
      ctx.fillRect(w/2.4 - 8, h/3 - 2, 14, h/5);
    }

  } else if (boss.id === 'zeus-colossal-vaca-boss') {
    // --- LEVEL 80: THE ZEUS COLOSSAL BULL BOSS ---
    ctx.save();
    // Godly celestial glow
    ctx.shadowBlur = 25;
    ctx.shadowColor = (boss.hp < boss.maxHp && isBlinking) ? '#ff5252' : '#ffd700';

    ctx.fillStyle = (boss.hp < boss.maxHp && isBlinking) ? '#ff6b6b' : '#1e272e';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;

    // Colossal body rounded box
    ctx.beginPath();
    ctx.roundRect(-w / 2.2, -h / 2.2, w / 1.1, h / 1.1, 24);
    ctx.fill();
    ctx.stroke();

    // Golden horns of power
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    // Horn left
    ctx.moveTo(-w / 3.5, -h / 2.2);
    ctx.quadraticCurveTo(-w / 2, -h / 1.1, -w / 1.6, -h / 1.3);
    ctx.quadraticCurveTo(-w / 2.4, -h / 2, -w / 3.5, -h / 2.2);
    // Horn right
    ctx.moveTo(w / 3.5, -h / 2.2);
    ctx.quadraticCurveTo(w / 2, -h / 1.1, w / 1.6, -h / 1.3);
    ctx.quadraticCurveTo(w / 2.4, -h / 2, w / 3.5, -h / 2.2);
    ctx.fill();
    ctx.stroke();

    // Lightning bolt pattern across forehead
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f5cd79';
    ctx.beginPath();
    ctx.moveTo(0, -h / 3);
    ctx.lineTo(15, -h / 6);
    ctx.lineTo(2, -h / 12);
    ctx.lineTo(20, h / 10);
    ctx.lineTo(-5, -h / 15);
    ctx.lineTo(2, -h / 6);
    ctx.closePath();
    ctx.fill();

    // Glistening thunder god eyes
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(-w/5, -h/9, 12, 0, Math.PI*2);
    ctx.arc(w/5, -h/9, 12, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-w/5 + 1, -h/9, 5, 0, Math.PI*2);
    ctx.arc(w/5 - 1, -h/9, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

  } else {
    // --- LEVEL 20: ANGRY DINOSAUR BOSS ---
    const isAngryDinoColor = (boss.hp < boss.maxHp && isBlinking) ? '#ff7675' : '#e63946'; // Furious Fiery Red Primary
    ctx.fillStyle = isAngryDinoColor;
    ctx.strokeStyle = '#220000';
    ctx.lineWidth = 3.5;

    // Main Head (Fierce T-Rex shape)
    ctx.fillRect(-w/6, -h/2, w/1.4, h/3); 
    ctx.fillRect(w/4, -h/3, w/4, h/8); // snout front

    // Sharp Angry Teeth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w/12, -h/6);
    ctx.lineTo(w/12 + 8, -h/6 + 10);
    ctx.lineTo(w/12 + 16, -h/6);
    ctx.lineTo(w/12 + 24, -h/6 + 10);
    ctx.lineTo(w/12 + 32, -h/6);
    ctx.lineTo(w/12 + 40, -h/6 + 10);
    ctx.closePath();
    ctx.fill();

    // Glowing Angry Eyes (Furious bright yellow iris, glowing red pupils)
    ctx.fillStyle = '#fffa65'; // Bright yellow eyes
    ctx.fillRect(4, -h/2 + 6, 16, 14);
    ctx.fillStyle = '#ff3838'; // Glowing red pupil
    ctx.fillRect(10, -h/2 + 10, 6, 6);

    // Deep furious slanted diagonal black eyebrows
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(1, -h/2);
    ctx.lineTo(24, -h/2 + 8);
    ctx.lineTo(24, -h/2 + 2);
    ctx.lineTo(1, -h/2 - 4);
    ctx.closePath();
    ctx.fill();

    // Snorting Steam/Nostril Fire
    const breathingCycle = Math.sin(Date.now() / 120);
    ctx.fillStyle = 'rgba(255, 175, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(w/2.4 + breathingCycle * 3, -h/4 + 2, 4 + breathingCycle * 2, 0, Math.PI * 2);
    ctx.fill();

    // Body (Angry blood orange back and main torso)
    ctx.fillStyle = (boss.hp < boss.maxHp && isBlinking) ? '#ff9f43' : '#d63031';
    ctx.fillRect(-w/3, -h/4 + 4, w/1.8, h/2.2);

    // Back Ridges / Spikes (Bright glowing yellow/purple fire tips)
    ctx.fillStyle = '#fdcb6e';
    ctx.fillRect(-w/3 - 10, -h/4 + 6, w/10, w/10);
    ctx.fillRect(-w/3 - 10, -h/4 + 18, w/10, w/10);
    ctx.fillRect(-w/3 - 10, -h/4 + 30, w/10, w/10);

    // Tiny Dino Arms (Angrily pointing forward)
    ctx.fillStyle = isAngryDinoColor;
    ctx.fillRect(w/4, -h/12, 20, 7);
    ctx.fillRect(w/4 + 14, -h/12, 7, 14);

    // Large Tail
    ctx.beginPath();
    ctx.moveTo(-w/3, -h/8);
    ctx.lineTo(-w/2 - 12, h/10);
    ctx.lineTo(-w/3, h/4 + 3);
    ctx.closePath();
    ctx.fill();

    // Running Legs animation (swapping legs angrily)
    const animFrame = Math.floor(Date.now() / 90) % 2 === 0;
    
    // Leg 1
    ctx.fillStyle = isAngryDinoColor;
    ctx.fillRect(-w/6, h/4 + 2, 16, h/4.5);
    ctx.fillStyle = '#fdcb6e'; // Claws
    ctx.fillRect(-w/6 - (animFrame ? 8 : 0), h/2 - 1, 24, 7); 

    // Leg 2
    ctx.fillStyle = (boss.hp < boss.maxHp && isBlinking) ? '#ff9f43' : '#b2bec3'; // alternate shadow leg
    ctx.fillRect(w/12, h/4 + 2, 16, h/4.5);
    ctx.fillStyle = '#efe9e6'; // Alternate claws
    ctx.fillRect(w/12 - (!animFrame ? 8 : 0), h/2 - 1, 24, 7); 
  }

  // HP Bar overlay
  ctx.shadowBlur = 0; // standard overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(-w/2, -h/2 - 25, w, 8);
  ctx.fillStyle = '#ff7675';
  ctx.fillRect(-w/2, -h/2 - 25, w * hpPercent, 8);

  ctx.restore();
}

export function drawCactus(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  const w = obs.width;
  const h = obs.height;

  // Classic Google Retro Cactus Color: Dark Gray-ish Green
  ctx.fillStyle = '#535353'; 
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;

  // Main Trunk (perfectly pixelated look)
  ctx.fillRect(-w/6, -h/2, w/3, h);

  // Left Branch
  ctx.fillRect(-w/2, -h/6, w/3, h/6); // Horizontal part
  ctx.fillRect(-w/2, -h/3, w/6, h/3); // Vertical part upwards

  // Right Branch
  ctx.fillRect(w/6, 0, w/3, h/6); // Horizontal part
  ctx.fillRect(w/3, -h/4, w/6, h/3.5); // Vertical part upwards

  // Bottom dirt mound
  ctx.fillRect(-w/2, h/2 - 4, w, 6);

  ctx.restore();
}

export function drawRobo(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#dfe6e9'; // Metallic silver
  
  const w = player.width;
  const h = player.height;

  // Main metallic body capsule
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 14);
  ctx.fill();
  ctx.stroke();

  // Panels & joints paths
  ctx.strokeStyle = '#b2bec3';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(0, h / 2);
  ctx.stroke();

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 3;

  // Cyberspace Visor Light (Neon Cyan)
  ctx.fillStyle = '#00cec9';
  ctx.beginPath();
  ctx.roundRect(w / 8, -h / 3, w / 2.5, h / 4, 4);
  ctx.fill();
  ctx.stroke();

  // Antennas / Bolts
  ctx.fillStyle = '#e17055'; // Glowing core
  ctx.beginPath();
  ctx.arc(-w/4, -h/2 - 8, 4, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-w/4, -h/2);
  ctx.lineTo(-w/4, -h/2 - 8);
  ctx.stroke();
}

export function drawAlien(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#1b1464';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#26de81'; // Alien bright green
  
  const w = player.width;
  const h = player.height;

  // Main alien round body
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 18);
  ctx.fill();
  ctx.stroke();

  // Big glossy black slanted pupil-less alien eye
  ctx.fillStyle = '#0f172a';
  ctx.save();
  ctx.translate(w / 5, -h / 6);
  ctx.rotate(Math.PI / 10);
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 4, h / 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Small eye highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(3, -3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bubble helmet
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // Alien mouth
  ctx.strokeStyle = '#1b1464';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(w / 4, h / 5, 5, 0, Math.PI);
  ctx.stroke();
}

export function drawDemon(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#2c003e';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#eb2f06'; // Sinister deep crimson

  const w = player.width;
  const h = player.height;

  // Body
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 14);
  ctx.fill();
  ctx.stroke();

  // Evil Horns (Glowing lava red)
  ctx.save();
  ctx.shadowColor = '#eb2f06';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ff3008';
  ctx.beginPath();
  ctx.moveTo(-w / 4, -h / 2);
  ctx.quadraticCurveTo(-w / 4 - 8, -h / 2 - 12, -w / 4 - 12, -h / 2 - 6);
  ctx.quadraticCurveTo(-w / 4 - 4, -h / 2 - 2, -w / 4 + 4, -h / 2);
  ctx.moveTo(w / 8, -h / 2);
  ctx.quadraticCurveTo(w / 8 + 8, -h / 2 - 12, w / 8 + 12, -h / 2 - 6);
  ctx.quadraticCurveTo(w / 8 + 4, -h / 2 - 2, w / 8 - 4, -h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Glowing yellow eyes
  ctx.fillStyle = '#feca57';
  ctx.beginPath();
  ctx.ellipse(w / 5, -h / 6, 6, 3, Math.PI / 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(w / 5 + 1, -h / 6, 2, 0, Math.PI * 2);
  ctx.fill();

  // Dark sinister grin
  ctx.strokeStyle = '#2c003e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(w / 6, h / 7, 7, 0, Math.PI);
  ctx.stroke();

  // Fangs
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(w / 6 - 4, h / 7 + 2);
  ctx.lineTo(w / 6 - 1, h / 7 + 8);
  ctx.lineTo(w / 6 + 1, h / 7 + 2);
  ctx.closePath();
  ctx.fill();
}

export function drawChicken(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#e17055';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#feca57'; // Bright golden yellow bird body

  const w = player.width;
  const h = player.height;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 3, w, h - 3, 16);
  ctx.fill();
  ctx.stroke();

  // Red double cockscomb on head
  ctx.fillStyle = '#ff7675';
  ctx.strokeStyle = '#d63031';
  ctx.beginPath();
  ctx.arc(-w / 4, -h / 2, 8, 0, Math.PI * 2);
  ctx.arc(-w / 4 + 8, -h / 2 - 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big round cartoon eyes
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 5, -h / 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(w / 5 + 1.5, -h / 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // Sharp orange beak
  ctx.fillStyle = '#e67e22';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 3, -1);
  ctx.lineTo(w / 2 + 10, 5);
  ctx.lineTo(w / 2 - 3, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tiny red wattle under beak
  ctx.fillStyle = '#ff7675';
  ctx.beginPath();
  ctx.ellipse(w / 3.2, h / 4, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function drawUnicorn(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#da70d6'; // Orchid pink outline
  ctx.lineWidth = 3;
  ctx.fillStyle = '#ffffff'; // Snowy white

  const w = player.width;
  const h = player.height;

  // Main magical horse body
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 12);
  ctx.fill();
  ctx.stroke();

  // Sparkly pastel pink flowing mane
  ctx.fillStyle = '#ff9ff3';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 3, -h / 3, w / 2.5, h * 0.8, 6);
  ctx.fill();
  ctx.stroke();

  // Glowing Magic Horn (Spiraling neon colors!)
  ctx.save();
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 12;
  const hornGrad = ctx.createLinearGradient(w / 4, -h / 2, w / 4 + 14, -h / 2 - 18);
  hornGrad.addColorStop(0, '#ff9ff3');
  hornGrad.addColorStop(0.5, '#feca57');
  hornGrad.addColorStop(1, '#00ffff');
  ctx.fillStyle = hornGrad;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(w / 4 - 4, -h / 2 + 2);
  ctx.lineTo(w / 4 + 15, -h / 2 - 18); // Point facing up and right
  ctx.lineTo(w / 4 + 5, -h / 2 + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Pristine purple eye
  ctx.fillStyle = '#9b59b6';
  ctx.beginPath();
  ctx.arc(w / 4, -h / 6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#100c24';
  ctx.beginPath();
  ctx.arc(w / 4 + 1, -h / 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 4 - 0.5, -h / 6 - 1, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Cute pink muzzle
  ctx.fillStyle = '#ffb8b8';
  ctx.strokeStyle = '#da70d6';
  ctx.beginPath();
  ctx.roundRect(w / 3.3, h / 8, w / 4, h / 3, 6);
  ctx.fill();
  ctx.stroke();
}

export function drawShark(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#485460'; // Sleek shark gray

  const w = player.width;
  const h = player.height;

  // Main shark capsule body
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 1, w, h - 2, 14);
  ctx.fill();
  ctx.stroke();

  // Big pointy dorsal fin on top
  ctx.fillStyle = '#485460';
  ctx.beginPath();
  ctx.moveTo(-w / 6, -h / 2 + 1);
  ctx.quadraticCurveTo(-w / 4, -h / 2 - 16, -w / 3, -h / 2 - 14);
  ctx.quadraticCurveTo(-w / 6, -h / 2 - 4, -w / 12, -h / 2 + 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Feral white shark eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 5, -h / 6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#d63031'; // Angry red pupil!
  ctx.beginPath();
  ctx.arc(w / 5 + 1.2, -h / 6, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Sharp rows of pearly white jagged fangs
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 1.8;
  
  // Draw jagged smile box
  ctx.beginPath();
  ctx.roundRect(w / 6, h / 10, w / 3, h / 3.5, 4);
  ctx.fill();
  ctx.stroke();

  // Fang serrations
  ctx.beginPath();
  ctx.moveTo(w / 6, h / 10 + 2);
  ctx.lineTo(w / 6 + 4, h / 10 + 8);
  ctx.lineTo(w / 6 + 8, h / 10 + 2);
  ctx.lineTo(w / 1.8 - 4, h / 10 + 2);
  ctx.stroke();
}

export function drawEnergyBomb(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // Blinking neon energy bomb
  const isBlink = Math.floor(Date.now() / 140) % 2 === 0;
  ctx.shadowColor = isBlink ? '#fffa65' : '#ff3838';
  ctx.shadowBlur = 15;
  
  // Bomb body
  ctx.fillStyle = isBlink ? '#ffd32c' : '#e74c3c';
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Highlight core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-obs.width / 6, -obs.height / 6, 3, 0, Math.PI * 2);
  ctx.fill();

  // Fuse and spark
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -obs.height / 2);
  ctx.quadraticCurveTo(8, -obs.height / 2 - 8, 4, -obs.height / 2 - 12);
  ctx.stroke();

  // Glow star spark
  ctx.fillStyle = '#fffa65';
  ctx.beginPath();
  ctx.arc(4, -obs.height / 2 - 12, 4 + Math.sin(Date.now() / 40) * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawKamikazeBird(ctx: CanvasRenderingContext2D, bird: Obstacle, flapping: number, flapScale: number) {
  // Red aerodynamic rocket bird
  ctx.shadowColor = '#ff383a';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ff383a';
  ctx.strokeStyle = '#220000';
  ctx.lineWidth = 2.5;

  // Missile-shaped bird body
  ctx.beginPath();
  ctx.roundRect(-bird.width / 2, -bird.height / 2.4, bird.width, bird.height / 1.2, 8);
  ctx.fill();
  ctx.stroke();

  // Rocket boosters strapped on top and bottom
  ctx.fillStyle = '#485460';
  ctx.fillRect(-bird.width / 4, -bird.height / 2 - 3, bird.width / 2, 4);
  ctx.strokeRect(-bird.width / 4, -bird.height / 2 - 3, bird.width / 2, 4);
  ctx.fillRect(-bird.width / 4, bird.height / 2.1, bird.width / 2, 4);
  ctx.strokeRect(-bird.width / 4, bird.height / 2.1, bird.width / 2, 4);

  // Tiny propulsion flames pointing backward
  ctx.fillStyle = '#ff9f43';
  ctx.beginPath();
  ctx.moveTo(bird.width / 4, -bird.height / 2);
  ctx.lineTo(bird.width / 4 + 10 + Math.sin(Date.now() / 20) * 4, -bird.height / 2 - 1);
  ctx.lineTo(bird.width / 4, -bird.height / 2 - 2);
  ctx.moveTo(bird.width / 4, bird.height / 2);
  ctx.lineTo(bird.width / 4 + 10 + Math.cos(Date.now() / 20) * 4, bird.height / 2 + 1);
  ctx.lineTo(bird.width / 4, bird.height / 2 + 2);
  ctx.fill();

  // Angry yellow fire skull face mask on the left (front)
  ctx.fillStyle = '#ffd32c';
  ctx.beginPath();
  ctx.ellipse(-bird.width / 4, 0, bird.width / 4, bird.height / 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Angry red eyes
  ctx.fillStyle = '#ff3838';
  ctx.beginPath();
  ctx.moveTo(-bird.width / 3.5, -3);
  ctx.lineTo(-bird.width / 6, -1);
  ctx.lineTo(-bird.width / 3.5, 1);
  ctx.closePath();
  ctx.fill();

  // Fins on tail (right side)
  ctx.fillStyle = '#d63031';
  ctx.beginPath();
  ctx.moveTo(bird.width / 2, -bird.height / 3);
  ctx.lineTo(bird.width / 2 + 8, -bird.height / 2);
  ctx.lineTo(bird.width / 3, -bird.height / 6);
  ctx.moveTo(bird.width / 2, bird.height / 3);
  ctx.lineTo(bird.width / 2 + 8, bird.height / 2);
  ctx.lineTo(bird.width / 3, bird.height / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function drawGrenadierBird(ctx: CanvasRenderingContext2D, bird: Obstacle, flapping: number, flapScale: number) {
  // Steel grey giant armored vulture bomber
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#3d3d3d';
  ctx.strokeStyle = '#1e272e';
  ctx.lineWidth = 3;

  const w = bird.width;
  const h = bird.height;

  // Armored bird fuselage body
  ctx.beginPath();
  ctx.ellipse(0, -2, w / 1.6, h / 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Armor shoulder plates (yellow hazard stripe decal)
  ctx.fillStyle = '#f1c40f'; // yellow
  ctx.beginPath();
  ctx.ellipse(-w / 8, -h / 3, w / 4, h / 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hazard black stripes
  ctx.fillStyle = '#2d3436';
  ctx.beginPath();
  ctx.moveTo(-w / 6, -h / 3 + 2);
  ctx.lineTo(-w / 12, -h / 3 - 4);
  ctx.lineTo(-w / 16, -h / 3 - 2);
  ctx.lineTo(-w / 8, -h / 3 + 4);
  ctx.fill();

  // Bomb pouch/bay mounted below
  const isCargoBlinking = Math.floor(Date.now() / 185) % 2 === 0;
  ctx.fillStyle = isCargoBlinking ? '#ff3838' : '#220000';
  ctx.beginPath();
  ctx.roundRect(-w / 3.2, h / 5, w / 1.6, h / 3.5, 4);
  ctx.fill();
  ctx.stroke();

  // Menacing red optics eye on the left (front)
  ctx.fillStyle = '#ff2a2a';
  ctx.beginPath();
  ctx.arc(-w / 2.5, -h / 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // Heavy steel beak
  ctx.fillStyle = '#7f8c8d';
  ctx.beginPath();
  ctx.moveTo(-w / 1.8, -h / 8);
  ctx.lineTo(-w / 1.2, h / 12);
  ctx.lineTo(-w / 1.8, h / 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Back metal mechanical wing
  ctx.fillStyle = '#1e272e';
  ctx.beginPath();
  ctx.ellipse(w / 4, -h / 6, 8, flapScale * 1.3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function drawCyberPunk(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#00d2d3';
  ctx.lineWidth = 3;

  const w = player.width;
  const h = player.height;

  // Stumpy neon glowing legs
  const legY = h / 2 - 2;
  const legH = 8;
  const legW = 7;
  ctx.fillStyle = '#ff9f43';
  ctx.fillRect(-w / 3, legY, legW, legH);
  ctx.strokeRect(-w / 3, legY, legW, legH);
  ctx.fillRect(w / 6, legY, legW, legH);
  ctx.strokeRect(w / 6, legY, legW, legH);

  // Body
  ctx.fillStyle = '#1e272e'; // dark carbon
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 10);
  ctx.fill();
  ctx.stroke();

  // Glowing cyber grid lines on body
  ctx.strokeStyle = 'rgba(0, 210, 211, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w/4, -h/4 + 4);
  ctx.lineTo(w/4, -h/4 + 4);
  ctx.moveTo(-w/3, h/6);
  ctx.lineTo(w/5, h/6);
  ctx.stroke();

  // Cyber Punk Sunglasses
  ctx.save();
  ctx.shadowColor = '#ff3838';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ff3838';
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(w / 8, -h / 4 - 4, w / 2.7, h / 2.6, 4);
  ctx.fill();
  ctx.stroke();

  // Visor glint
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 8 + 3, -h / 4);
  ctx.lineTo(w / 8 + 14, -h / 4 + 8);
  ctx.stroke();
  ctx.restore();

  // Headphones
  ctx.fillStyle = '#00d2d3';
  ctx.beginPath();
  ctx.roundRect(-w / 3.4, -h / 2, 7, h / 1.4, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-w / 3.4 + 3.5, -h / 4, 8, 0, Math.PI * 2);
  ctx.fill();
}

export function drawMegaMech(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#1e272e';
  ctx.lineWidth = 3;
  
  const w = player.width;
  const h = player.height;

  const legY = h / 2 - 2;
  ctx.fillStyle = '#7f8c8d';
  ctx.fillRect(-w / 3, legY, 7, 8);
  ctx.strokeRect(-w / 3, legY, 7, 8);
  ctx.fillRect(w / 6, legY, 7, 8);
  ctx.strokeRect(w / 6, legY, 7, 8);

  const bodyGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  bodyGrad.addColorStop(0, '#f5f6fa'); // White plating
  bodyGrad.addColorStop(1, '#dcdde1');
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2 + 5);
  ctx.lineTo(w / 2, -h / 2 + 5);
  ctx.lineTo(w / 2, h / 2 - 5);
  ctx.lineTo(-w / 2, h / 2 - 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Panel rivets
  ctx.fillStyle = '#7f8c8d';
  ctx.fillRect(-w/3.5, -h/3, 4, 4);
  ctx.fillRect(w/4.5, h/6, 4, 4);

  // Gundam V-Fin Golden Crown
  ctx.fillStyle = '#f1c40f';
  ctx.strokeStyle = '#1e272e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 8, -h / 2 + 4);
  ctx.lineTo(w / 3, -h / 2 - 12);
  ctx.lineTo(w / 5, -h / 2 + 4);
  ctx.lineTo(-w / 12, -h / 2 - 12);
  ctx.lineTo(0, -h / 2 + 4);
  ctx.fill();
  ctx.stroke();

  // Glowing arc reactor core in center
  ctx.save();
  ctx.shadowColor = '#00d2d3';
  ctx.shadowBlur = 12;
  const pulseScale = 1.0 + Math.sin(Date.now() / 90) * 0.15;
  ctx.fillStyle = '#00ffff';
  ctx.beginPath();
  ctx.arc(-w / 12, h / 12, 6 * pulseScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Visor
  ctx.fillStyle = '#00ff66';
  ctx.fillRect(w/5, -h/4, 12, 5);
}

export function drawSpatialAstronaut(ctx: CanvasRenderingContext2D, player: Player) {
  ctx.strokeStyle = '#353b48';
  ctx.lineWidth = 3;

  const w = player.width;
  const h = player.height;

  const legY = h / 2 - 2;
  ctx.fillStyle = '#dcdde1';
  ctx.fillRect(-w / 3, legY, 8, 8);
  ctx.fillRect(w / 6, legY, 8, 8);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 14);
  ctx.fill();
  ctx.stroke();

  // Chest emblem
  ctx.fillStyle = '#2e86de';
  ctx.fillRect(-w/4, -h/10, 8, 6);

  // Helmet visor
  ctx.save();
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  
  const glassGrad = ctx.createLinearGradient(w/12, -h/3, w/2, h/3);
  glassGrad.addColorStop(0, '#00d2d3');
  glassGrad.addColorStop(1, '#0a3d62');
  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = '#f5f6fa';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(w / 5, -h / 8, h / 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glass shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(w / 2 - 6, -h / 8 - 4, 3, 1.5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Oxygen tank
  ctx.fillStyle = '#f5f6fa';
  ctx.beginPath();
  ctx.roundRect(-w / 1.5, -h / 3.4, w / 4, h / 1.7, 4);
  ctx.fill();
  ctx.stroke();
}

export function drawRainbowNeon(ctx: CanvasRenderingContext2D, player: Player) {
  const hue = (Date.now() / 6.5) % 360;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;

  const w = player.width;
  const h = player.height;

  const legY = h / 2 - 2;
  ctx.fillStyle = `hsl(${(hue + 180) % 360}, 100%, 65%)`;
  ctx.fillRect(-w / 3, legY, 7, 8);
  ctx.fillRect(w / 6, legY, 7, 8);

  ctx.save();
  ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
  ctx.shadowBlur = 18;
  ctx.fillStyle = `hsl(${hue}, 95%, 55%)`;
  
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 12);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-w/4, -h/12, 6, 0, Math.PI * 2);
  ctx.arc(w/4, h/6, 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w/5, -h/4, 12, 6);
  ctx.restore();

  ctx.fillStyle = `hsl(${(hue + 90) % 360}, 100%, 60%)`;
  ctx.beginPath();
  ctx.roundRect(-w / 3.4, -h / 2, 6, h / 1.4, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-w / 3.4 + 3, -h / 4, 8, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSecretZeus(ctx: CanvasRenderingContext2D, player: Player) {
  const w = player.width;
  const h = player.height;

  // Draw 2 stump legs (white & yellow hooves)
  const legY = h / 2 - 2;
  ctx.strokeStyle = '#1e272e';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = '#f1c40f'; // Gold legs
  ctx.fillRect(-w / 3, legY, 7, 8);
  ctx.strokeRect(-w / 3, legY, 7, 8);
  ctx.fillRect(w / 6, legY, 7, 8);
  ctx.strokeRect(w / 6, legY, 7, 8);

  ctx.save();
  // Cyan glowing electric cloud aura shadow
  ctx.shadowColor = '#00d2ff';
  ctx.shadowBlur = 20;

  // Linear electric gradient body
  const bodyGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  bodyGrad.addColorStop(0, '#0f172a'); // slate-900
  bodyGrad.addColorStop(0.5, '#0284c7'); // sky-600
  bodyGrad.addColorStop(1, '#00d2ff'); // cyan

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 12);
  ctx.fill();
  ctx.stroke();

  // Draw golden lightning spots
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.arc(-w / 4, -h / 6, 7, 0, Math.PI * 2);
  ctx.arc(w / 4, h / 6, 5, 0, Math.PI * 2);
  ctx.fill();

  // Zeus golden lightning crown/horns
  ctx.fillStyle = '#ffd700'; // Pure bright gold
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  
  // Left lightning horn
  ctx.beginPath();
  ctx.moveTo(-w / 4, -h / 2 + 2);
  ctx.lineTo(-w / 4 - 5, -h / 2 - 12);
  ctx.lineTo(-w / 4 + 2, -h / 2 - 4);
  ctx.lineTo(-w / 4, -h / 2 + 2);
  ctx.fill();
  ctx.stroke();

  // Right lightning horn
  ctx.beginPath();
  ctx.moveTo(w / 12, -h / 2 + 2);
  ctx.lineTo(w / 12 + 5, -h / 2 - 12);
  ctx.lineTo(w / 12 - 2, -h / 2 - 4);
  ctx.lineTo(w / 12, -h / 2 + 2);
  ctx.fill();
  ctx.stroke();

  // Cute white round eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-w/6, -h/6, 4, 0, Math.PI * 2);
  ctx.arc(w/6, -h/6, 4, 0, Math.PI * 2);
  ctx.fill();

  // Neon light-blue core visor overlay
  ctx.fillStyle = 'rgba(0, 210, 255, 0.45)';
  ctx.fillRect(-w / 4, -h / 4, w / 2, 4);

  ctx.restore();
}
