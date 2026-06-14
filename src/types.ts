export type GameState = 'SPLASH' | 'LOBBY' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' | 'PAUSED' | 'WORLD_DESTROY_PORTAL';

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export type SkinType = 'DEFAULT' | 'COOL' | 'PIG' | 'CAT' | 'ROBO' | 'ALIEN' | 'GOLDEN' | 'FIRE' | 'DEMON' | 'CHICKEN' | 'UNICORN' | 'SHARK' | 'CYBER_PUNK' | 'MEGA_MECH' | 'SPATIAL_ASTRONAUT' | 'RAINBOW_NEON' | 'SECRET_ZEUS';

export interface Player extends Entity {
  vy: number;
  rotation: number;
  lives: number;
  hasPower: boolean;
  powerTimer: number;
  coolBirdsKilled: number;
  skin: SkinType;
  invulnTimer: number;
  hasShield?: boolean;
  shieldTimer?: number;
  hasDoublePoints?: boolean;
  doublePointsTimer?: number;
}

export interface UserStats {
  unlockedLevels: number;
  highScore: number;
  credits: number;
  unlockedSkins: SkinType[];
  activeSkin: SkinType;
}

export interface Obstacle extends Entity {
  speed: number;
  variant?: 'yellow' | 'black' | 'cool' | 'ninja' | 'fire-bat' | 'ghost' | 'robo-copter' | 'kamikaze' | 'grenadier' | 'bomb';
  variation?: number; // For sine movement
  isBossProjectile?: boolean;
  reflected?: boolean;
  variationY?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Boss extends Entity {
  hp: number;
  maxHp: number;
  vy: number;
  direction: number;
  state: 'entering' | 'active' | 'defeated';
  shootTimer: number;
}
