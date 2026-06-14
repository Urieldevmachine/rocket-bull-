import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  GRAVITY, 
  THRUST, 
  MAX_VY, 
  OBSTACLE_SPEED,
  SPAWN_RATE,
  BIRD_SPAWN_RATE,
  POWERUP_SPAWN_RATE,
  TERMINAL_VELOCITY
} from '../constants';
import { Player, Obstacle, Entity, Particle, GameState, SkinType, Boss } from '../types';
import { 
  drawSky, 
  drawGround, 
  drawBull, 
  drawObstacle, 
  drawBird, 
  drawCloud, 
  drawPowerUp,
  drawParticle,
  drawBoss,
  drawCactus
} from '../lib/render';
import { Trophy, Heart, Play, RotateCcw, User, Globe, ShoppingBag, Coins, ShieldAlert, Loader2, Lock, Pause, X, Eye, EyeOff, Settings, Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithGoogle, saveHighScore, getLeaderboard } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const INITIAL_PLAYER: Player = {
  id: 'player',
  x: 150,
  y: 110,
  width: 50,
  height: 40,
  vy: 0,
  rotation: 0,
  lives: 3,
  hasPower: false,
  powerTimer: 0,
  coolBirdsKilled: 0,
  type: 'player',
  skin: 'DEFAULT',
  invulnTimer: 0,
  hasShield: false,
  shieldTimer: 0,
  hasDoublePoints: false,
  doublePointsTimer: 0
};

const SKINS: { type: SkinType; name: string; cost: number; emoji: string }[] = [
  { type: 'DEFAULT', name: 'Original', cost: 0, emoji: '🐄' },
  { type: 'COOL', name: 'Agent Cow', cost: 5000, emoji: '😎' },
  { type: 'PIG', name: 'Turbo Pig', cost: 12000, emoji: '🐷' },
  { type: 'CAT', name: 'Cosmo Cat', cost: 25000, emoji: '🐱' },
  { type: 'ROBO', name: 'Robo Bull', cost: 45000, emoji: '🤖' },
  { type: 'ALIEN', name: 'Alien Bull', cost: 70000, emoji: '👽' },
  { type: 'GOLDEN', name: 'Prestige 24K', cost: 110000, emoji: '👑' },
  { type: 'FIRE', name: 'Lava Demon', cost: 150000, emoji: '🔥' },
  { type: 'DEMON', name: 'Demon Cow', cost: 200000, emoji: '😈' },
  { type: 'CHICKEN', name: 'Flyer Chicken', cost: 250005, emoji: '🐔' },
  { type: 'UNICORN', name: 'Magical Unicorn', cost: 350000, emoji: '🦄' },
  { type: 'SHARK', name: 'Aero Shark', cost: 450000, emoji: '🦈' },
  { type: 'CYBER_PUNK', name: 'Cyberpunk Visor', cost: 550000, emoji: '🕶️' },
  { type: 'MEGA_MECH', name: 'Grand Robot Mecha', cost: 750000, emoji: '🦾' },
  { type: 'SPATIAL_ASTRONAUT', name: 'AstroCow', cost: 1000000, emoji: '👩‍🚀' },
  { type: 'RAINBOW_NEON', name: 'Elite RGB Neon', cost: 1500000, emoji: '🌈' },
  { type: 'SECRET_ZEUS', name: 'Secret Zeus ⚡', cost: 2500000, emoji: '⚡' },
];

export interface BuyableEnemy {
  id: string;
  name: string;
  cost: number;
  mult: number;
  emoji: string;
  desc: string;
}

const BUYABLE_ENEMIES: BuyableEnemy[] = [
  { id: 'yellow', name: 'Pájaro Amarillo', cost: 2500, mult: 0.10, emoji: '🐤', desc: 'Sincroniza telemetría básica. +10% créditos/XP de por vida.' },
  { id: 'cool', name: 'Gaviota Cool', cost: 6000, mult: 0.15, emoji: '🕶️', desc: 'Añade estilo aerodinámico. +15% créditos/XP de por vida.' },
  { id: 'ninja', name: 'Halcón Ninja', cost: 12000, mult: 0.20, emoji: '🥷', desc: 'Estudia tácticas evasivas de sigilo. +20% ganancias.' },
  { id: 'kamikaze', name: 'Cuervo Kamikaze', cost: 22000, mult: 0.25, emoji: '💥', desc: 'Sintoniza impulsos agresivos estables. +25% ganancias.' },
  { id: 'fire-bat', name: 'Bat Volcánico', cost: 35000, mult: 0.30, emoji: '🔥', desc: 'Asimila flujos de lava ardiente. +30% ganancias.' },
  { id: 'grenadier', name: 'Goliath Grenadier', cost: 50000, mult: 0.35, emoji: '💣', desc: 'Añade blindaje reactivo explosivo. +35% ganancias.' },
  { id: 'robo-copter', name: 'Robocóptero Elite', cost: 75000, mult: 0.40, emoji: '🚁', desc: 'Integra motores de fusión H5. +40% ganancias de por vida.' },
  { id: 'ghost', name: 'Espíritu Fantasma', cost: 110000, mult: 0.50, emoji: '👻', desc: 'Trascendencia dimensional astral. +50% ganancias totales de por vida!' }
];

const AI_DIFFICULTIES = {
  FACIL: { lives: 2, reward: 105, reactionRange: 200, label: 'Fácil', desc: 'Vaca IA novata, se asusta fácil y comete imprecisiones' },
  MEDIO: { lives: 3, reward: 260, reactionRange: 260, label: 'Medio', desc: 'Esquivas tácticas estándar equilibradas' },
  DIFICIL: { lives: 4, reward: 520, reactionRange: 330, label: 'Difícil', desc: 'Piloto veterano con reflejos ágiles' },
  SUPREMO: { lives: 5, reward: 1100, reactionRange: 385, label: 'Supremo', desc: '¡IA Táctica con ultra instinto pero humana!' }
} as const;

export const SKIN_ATTRS: Record<SkinType, { speed: number; armor: number; points: number; special: number; label: string }> = {
  DEFAULT: { speed: 45, armor: 40, points: 30, special: 10, label: 'Básico' },
  COOL: { speed: 65, armor: 45, points: 50, special: 30, label: 'Agente Secreto' },
  PIG: { speed: 85, armor: 30, points: 40, special: 20, label: 'Propulsor Turbo' },
  CAT: { speed: 70, armor: 50, points: 55, special: 40, label: 'Fuerza Cósmica' },
  ROBO: { speed: 50, armor: 80, points: 50, special: 50, label: 'Cibernético' },
  ALIEN: { speed: 75, armor: 60, points: 70, special: 65, label: 'Xenomorfo' },
  GOLDEN: { speed: 70, armor: 70, points: 100, special: 75, label: 'Prestigio Áureo' },
  FIRE: { speed: 80, armor: 75, points: 65, special: 85, label: 'Llama del Inframundo' },
  DEMON: { speed: 85, armor: 80, points: 75, special: 90, label: 'Heraldo del Caos' },
  CHICKEN: { speed: 90, armor: 35, points: 80, special: 80, label: 'Aviador Veloz' },
  UNICORN: { speed: 85, armor: 70, points: 90, special: 95, label: 'Mágica Polvo de Estrellas' },
  SHARK: { speed: 95, armor: 55, points: 85, special: 85, label: 'Aero-Depredador' },
  CYBER_PUNK: { speed: 90, armor: 75, points: 95, special: 90, label: 'Hacker Rebelde' },
  MEGA_MECH: { speed: 75, armor: 100, points: 90, special: 95, label: 'Armadura Pesada Titan' },
  SPATIAL_ASTRONAUT: { speed: 85, armor: 85, points: 95, special: 90, label: 'Cosmonauta Elite' },
  RAINBOW_NEON: { speed: 95, armor: 90, points: 100, special: 95, label: 'Fuerza RGB Máxima' },
  SECRET_ZEUS: { speed: 100, armor: 100, points: 100, special: 100, label: 'Deidad del Olimpo ⚡' },
};

export const FlightStatsDashboard: React.FC<{
  scoreHistory: number[];
  activeSkin: SkinType;
  totalMatches: number;
}> = ({ scoreHistory, activeSkin, totalMatches }) => {
  const [selectedTab, setSelectedTab] = useState<'history' | 'attributes'>('history');
  
  const attrs = SKIN_ATTRS[activeSkin] || SKIN_ATTRS.DEFAULT;
  
  // Graphic 1: Score history trend coordinates calculation
  const historyData = scoreHistory.length > 0 ? scoreHistory : [0];
  const maxScore = Math.max(...historyData, 100);
  const paddingX = 35;
  const paddingY = 25;
  const chartWidth = 320;
  const chartHeight = 110;
  
  const points = historyData.map((val, idx) => {
    const x = idx * (chartWidth / Math.max(1, historyData.length - 1)) + paddingX;
    const y = chartHeight - (val / maxScore) * (chartHeight - paddingY * 2) - paddingY;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  const averageScore = Math.round(historyData.reduce((a, b) => a + b, 0) / historyData.length);
  const peakScore = Math.max(...historyData);

  // Graphic 2: Cybernetic Radial spider values / Radar chart paths
  const cx = 105;
  const cy = 105;
  const r = 70;
  
  // Angle for 4 elements: speed (0 deg), armor (90 deg), points (180 deg), special (270 deg)
  const getRadarPoint = (val: number, angleDegrees: number) => {
    const angleRad = (angleDegrees - 90) * (Math.PI / 180);
    const distance = (val / 100) * r;
    const x = cx + distance * Math.cos(angleRad);
    const y = cy + distance * Math.sin(angleRad);
    return { x, y };
  };

  const pSpeed = getRadarPoint(attrs.speed, 0);
  const pArmor = getRadarPoint(attrs.armor, 90);
  const pPoints = getRadarPoint(attrs.points, 180);
  const pSpecial = getRadarPoint(attrs.special, 270);

  const radarPath = `M ${pSpeed.x} ${pSpeed.y} L ${pArmor.x} ${pArmor.y} L ${pPoints.x} ${pPoints.y} L ${pSpecial.x} ${pSpecial.y} Z`;

  return (
    <div className="w-full max-w-xl bg-slate-950/85 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/10 mb-6 text-left relative overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-sm font-black">📊</div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider leading-none">Telemetría de Vuelo</h4>
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mt-0.5 font-mono">Gráficos de Combate & Rendimiento</span>
          </div>
        </div>
        <div className="flex bg-black/40 border border-white/10 rounded-full p-0.5 text-[9px] font-black uppercase font-mono">
          <button 
            type="button"
            onClick={() => setSelectedTab('history')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${selectedTab === 'history' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Puntajes
          </button>
          <button 
            type="button"
            onClick={() => setSelectedTab('attributes')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${selectedTab === 'attributes' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Radar Toro
          </button>
        </div>
      </div>

      {selectedTab === 'history' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 flex flex-col justify-center">
            {/* Visual Line/Area Chart */}
            <div className="relative bg-black/60 rounded-2xl p-2 border border-white/5 shadow-inner flex flex-col items-center">
              <svg viewBox={`0 0 ${chartWidth + paddingX + 15} ${chartHeight}`} className="w-full h-[120px] overflow-visible">
                <defs>
                  <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal reference lines */}
                {[0, 0.5, 1].map((ratio) => {
                  const yVal = paddingY + ratio * (chartHeight - paddingY * 2);
                  const scoreLabel = Math.round(maxScore - ratio * maxScore);
                  return (
                    <g key={ratio} className="opacity-15">
                      <line x1={paddingX} y1={yVal} x2={chartWidth + paddingX} y2={yVal} stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
                      <text x={paddingX - 8} y={yVal + 3} fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="end">{scoreLabel}</text>
                    </g>
                  );
                })}

                {/* Filled Area */}
                {areaD && <path d={areaD} fill="url(#scoreArea)" />}
                
                {/* Main Curve Line */}
                {pathD && (
                  <motion.path 
                    d={pathD} 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                )}

                {/* Nodes representing matches */}
                {points.map((p, idx) => (
                  <g key={idx} className="group/node">
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={idx === points.length - 1 ? 4.5 : 3} 
                      fill={idx === points.length - 1 ? '#06b6d4' : '#1e293b'} 
                      stroke="#06b6d4" 
                      strokeWidth="1.5" 
                      className="transition-all duration-150 cursor-pointer hover:r-5 hover:fill-amber-400"
                    />
                    <text x={p.x} y={p.y - 8} fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle" className="opacity-0 group-hover/node:opacity-100 transition-opacity bg-black duration-150 py-0.5 px-1 rounded">
                      {Math.round(p.val)}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-2 right-4 flex items-center gap-1.5 text-[8px] font-black tracking-widest text-[#06b6d4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-ping" />
                <span>RITMO DE EVOLUCIÓN</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-4 flex flex-col justify-between gap-2.5 h-full">
            <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <div>
                <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-none font-mono">Pico Táctico</span>
                <span className="text-white font-black text-xs sm:text-sm tabular-nums leading-none mt-1 block">{peakScore.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
              <span className="text-xl">📈</span>
              <div>
                <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-none font-mono">Media Táctica</span>
                <span className="text-cyan-400 font-black text-xs sm:text-sm tabular-nums leading-none mt-1 block">{averageScore.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
              <span className="text-xl">🌌</span>
              <div>
                <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-none font-mono">Vuelos Totales</span>
                <span className="text-indigo-400 font-black text-xs sm:text-sm tabular-nums leading-none mt-1 block">{totalMatches.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 flex justify-center py-1">
            {/* Holographic Radar Web */}
            <div className="relative bg-black/60 rounded-2xl p-2 border border-white/5 w-[140px] h-[140px] flex items-center justify-center">
              <svg viewBox="0 0 210 210" className="w-[124px] h-[124px] overflow-visible">
                {/* Radar Grid Concentric Circles */}
                {[0.25, 0.5, 0.75, 1].map((scale) => (
                  <circle key={scale} cx={cx} cy={cy} r={r * scale} fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="2,2" className="opacity-25" />
                ))}
                
                {/* Radial axes */}
                <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#4f46e5" strokeWidth="1" className="opacity-15" />
                <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#4f46e5" strokeWidth="1" className="opacity-15" />
                
                {/* Core Attribute Polygon Area */}
                <path d={radarPath} fill="rgba(99, 102, 241, 0.3)" stroke="#818cf8" strokeWidth="2.5" />
                
                {/* Node Markers */}
                <circle cx={pSpeed.x} cy={pSpeed.y} r="3" fill="#818cf8" />
                <circle cx={pArmor.x} cy={pArmor.y} r="3" fill="#818cf8" />
                <circle cx={pPoints.x} cy={pPoints.y} r="3" fill="#818cf8" />
                <circle cx={pSpecial.x} cy={pSpecial.y} r="3" fill="#818cf8" />

                {/* Radar outer labels */}
                <text x={cx} y={cy - r - 8} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">VEL</text>
                <text x={cx + r + 6} y={cy + 3} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="start">BLI</text>
                <text x={cx} y={cy + r + 13} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">BOT</text>
                <text x={cx - r - 6} y={cy + 3} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="end">ZUS</text>
              </svg>
            </div>
          </div>
          
          <div className="md:col-span-7 space-y-2">
            <div className="text-left mb-1">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">Traje: {attrs.label}</span>
              <p className="text-[9px] text-gray-400 italic">Cada armadura altera las resonancias de combate.</p>
            </div>
            
            {/* Stat Bars */}
            {[
              { id: 'vel', name: 'Velocidad Máxima', val: attrs.speed, col: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' },
              { id: 'arm', name: 'Blindaje de Escudos', val: attrs.armor, col: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' },
              { id: 'bot', name: 'Multiplicador de Botines', val: attrs.points, col: 'bg-yellow-500 shadow-[0_0_8px_#eab308]' },
              { id: 'spe', name: 'Resonancia Zeus Lightning', val: attrs.special, col: 'bg-purple-500 shadow-[0_0_8px_#a855f7]' }
            ].map((st) => (
              <div key={st.id} className="space-y-0.5">
                <div className="flex justify-between text-[8px] sm:text-[9px] uppercase font-bold tracking-wider leading-none">
                  <span className="text-gray-300 font-mono">{st.name}</span>
                  <span className="text-white font-black tabular-nums">{st.val}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5 relative">
                  <div className={`h-full ${st.col} rounded-full transition-all duration-300`} style={{ width: `${st.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const RocketBullGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('SPLASH');
  const [hardcoreUnlocked, setHardcoreUnlocked] = useState(() => {
    const saved = localStorage.getItem('rocketbull_hardcore_unlocked');
    return saved === 'true';
  });
  const [isHardcore, setIsHardcore] = useState(() => {
    const unlocked = localStorage.getItem('rocketbull_hardcore_unlocked') === 'true';
    if (!unlocked) return false;
    const saved = localStorage.getItem('rocketbull_hardcore_active');
    return saved === 'true';
  });
  const [worldDestroyProgress, setWorldDestroyProgress] = useState(0);
  const [level, setLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState(() => {
    const saved = localStorage.getItem('rocketbull_unlocked_levels');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('rocketbull_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [credits, setCreditsState] = useState(() => {
    const saved = localStorage.getItem('rocketbull_credits');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [boughtEnemies, setBoughtEnemies] = useState<string[]>(() => {
    const saved = localStorage.getItem('rocketbull_bought_enemies');
    return saved ? JSON.parse(saved) : [];
  });
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('rocketbull_xp');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [xpLevel, setXpLevel] = useState(() => {
    const saved = localStorage.getItem('rocketbull_xp_level');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [zeusCooldown, setZeusCooldown] = useState(0);

  const [scoreHistory, setScoreHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem('rocketbull_score_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [110, 240, 190, 420, 310, 590]; // Accurate starting statistics
  });

  const [totalMatches, setTotalMatches] = useState(() => {
    const saved = localStorage.getItem('rocketbull_total_matches');
    return saved ? parseInt(saved, 10) : 6;
  });

  const addXp = useCallback((amount: number) => {
    setXp(v => {
      let nextXp = v + amount;
      let nextLevel = xpLevel;
      let xpNeeded = 1000 + nextLevel * 500;
      let leveledUp = false;

      while (nextXp >= xpNeeded) {
        nextXp -= xpNeeded;
        nextLevel += 1;
        xpNeeded = 1000 + nextLevel * 500;
        leveledUp = true;
      }

      if (leveledUp) {
        setXpLevel(nextLevel);
        localStorage.setItem('rocketbull_xp_level', nextLevel.toString());

        // Award level-up bonus credits directly using setCreditsState to prevent recursion loops
        const bonusCredits = nextLevel * 400;
        setCreditsState(c => {
          const nextC = c + bonusCredits;
          localStorage.setItem('rocketbull_credits', nextC.toString());
          return nextC;
        });

        // Trigger gorgeous gold level up particles
        for (let i = 0; i < 35; i++) {
          particlesRef.current.push({
            id: `p-lvl-${Date.now()}-${Math.random()}-${i}`,
            x: playerRef.current.x,
            y: playerRef.current.y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1.2,
            maxLife: 1.2,
            color: '#ffd700',
            size: 3 + Math.random() * 4
          });
        }
      }

      localStorage.setItem('rocketbull_xp', nextXp.toString());
      return nextXp;
    });
  }, [xpLevel]);

  const [unlockedSkins, setUnlockedSkins] = useState<SkinType[]>(() => {
    const saved = localStorage.getItem('rocketbull_unlocked_skins');
    return saved ? JSON.parse(saved) : ['DEFAULT'];
  });
  const [activeSkin, setActiveSkin] = useState<SkinType>(() => {
    const saved = localStorage.getItem('rocketbull_active_skin');
    return (saved as SkinType) || 'DEFAULT';
  });
  const [hudMode, setHudMode] = useState<'FULL' | 'MINIMAL' | 'HIDDEN'>(() => {
    const saved = localStorage.getItem('rocketbull_hud_mode');
    return (saved as 'FULL' | 'MINIMAL' | 'HIDDEN') || 'FULL';
  });

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [enemies, setEnemies] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [rankingTab, setRankingTab] = useState<'global' | 'legends'>('global');
  const [showShop, setShowShop] = useState(false);
  const [sessionReward, setSessionReward] = useState(0);
  const [showBestiary, setShowBestiary] = useState(false);
  const [bestiaryTab, setBestiaryTab] = useState<'shop' | 'bio'>('shop');
  const [loadingEnemies, setLoadingEnemies] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Daily Rewards and Achievements state
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [claimStreak, setClaimStreak] = useState(() => {
    const saved = localStorage.getItem('rocketbull_claim_streak');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lastClaimTime, setLastClaimTime] = useState(() => {
    const saved = localStorage.getItem('rocketbull_last_claim_time');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isDailyClaimable, setIsDailyClaimable] = useState(false);
  
  const [birdsDefeatedCount, setBirdsDefeatedCount] = useState(() => {
    const saved = localStorage.getItem('rocketbull_mission_birds');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [claimedMissions, setClaimedMissions] = useState<string[]>(() => {
    const saved = localStorage.getItem('rocketbull_claimed_missions');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings & Codes System
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('rocketbull_sound_enabled');
    return saved !== 'false';
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('rocketbull_music_enabled');
    return saved !== 'false';
  });
  const [customMusicId, setCustomMusicId] = useState(() => {
    return localStorage.getItem('rocketbull_custom_music_id') || '';
  });
  const [tempMusicId, setTempMusicId] = useState(customMusicId);

  const handleCustomMusicIdChange = (id: string) => {
    setCustomMusicId(id);
    localStorage.setItem('rocketbull_custom_music_id', id);
  };

  const isYouTubeId = (str: string) => {
    return /^[a-zA-Z0-9_-]{11}$/.test(str.trim());
  };

  const extractYouTubeId = (str: string) => {
    const trimmed = str.trim();
    if (isYouTubeId(trimmed)) return trimmed;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isDirectAudioUrl = (str: string) => {
    const s = str.trim().toLowerCase();
    return s.startsWith('http') && (s.endsWith('.mp3') || s.endsWith('.ogg') || s.endsWith('.wav') || s.includes('audio-file') || s.includes('stream'));
  };

  const ytId = extractYouTubeId(customMusicId);
  const audioUrl = isDirectAudioUrl(customMusicId) ? customMusicId.trim() : '';
  const isCustomMusicActive = !!(ytId || audioUrl);
  const [showSettings, setShowSettings] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    if (gameState !== 'WORLD_DESTROY_PORTAL') {
      setWorldDestroyProgress(0);
      return;
    }
    
    let current = 0;
    const interval = setInterval(() => {
      current += 1.0;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }
      setWorldDestroyProgress(current);
    }, 45); // Takes around 4.5 seconds to complete
    
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (lastClaimTime === 0) {
      setIsDailyClaimable(true);
    } else {
      const msPassed = Date.now() - lastClaimTime;
      const hoursPassed = msPassed / (1000 * 60 * 60);
      
      if (hoursPassed >= 20) {
        setIsDailyClaimable(true);
        // If more than 48 hours passed, reset streak
        if (hoursPassed >= 48) {
          setClaimStreak(0);
          localStorage.setItem('rocketbull_claim_streak', '0');
        }
      } else {
        setIsDailyClaimable(false);
      }
    }
  }, [lastClaimTime]);

  // New expansion modes state
  const [gameMode, setGameMode] = useState<'LEVELS' | 'INFINITE' | 'AI_DODGE' | 'MULTIPLAYER'>('LEVELS');
  const [aiLives, setAiLives] = useState(3);
  const aiLivesRef = useRef(3);

  // Multiplayer variables
  const [chaosPoints, setChaosPoints] = useState(50);
  const chaosPointsRef = useRef(50);
  const [selectedMultiplayerBird, setSelectedMultiplayerBird] = useState<'yellow' | 'cool' | 'ninja' | 'kamikaze' | 'grenadier'>('yellow');
  const [multiplayerWinner, setMultiplayerWinner] = useState<'NONE' | 'COW' | 'CHAOS'>('NONE');

  // AI Duel difficulty configurations
  const [aiDifficulty, setAiDifficultyState] = useState<'FACIL' | 'MEDIO' | 'DIFICIL' | 'SUPREMO'>('FACIL');
  const aiDifficultyRef = useRef<'FACIL' | 'MEDIO' | 'DIFICIL' | 'SUPREMO'>('FACIL');
  const setAiDifficulty = (diff: 'FACIL' | 'MEDIO' | 'DIFICIL' | 'SUPREMO') => {
    setAiDifficultyState(diff);
    aiDifficultyRef.current = diff;
  };

  // Cooldown for birds
  const [birdCooldown, setBirdCooldown] = useState(0);
  const birdCooldownRef = useRef(0);

  useEffect(() => {
    if (showBestiary && enemies.length === 0) {
      fetchEnemies();
    }
  }, [showBestiary]);

  const fetchEnemies = async () => {
    setLoadingEnemies(true);
    try {
      const res = await fetch('/api/generate-enemies', { method: 'POST' });
      const data = await res.json();
      if (data.enemies) {
        setEnemies(data.enemies);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEnemies(false);
    }
  };

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      // Error already handled and logged in signInWithGoogle
    } finally {
      setIsSigningIn(false);
    }
  };
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: GAME_WIDTH, height: GAME_HEIGHT });
  const [scale, setScale] = useState(1);

  const scoreRef = useRef(0);
  const highScoreRef = useRef(highScore);
  const levelRef = useRef(level);
  const unlockedLevelsRef = useRef(unlockedLevels);

  // Sync refs and persist
  useEffect(() => {
    localStorage.setItem('rocketbull_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(unlockedSkins));
  }, [unlockedSkins]);

  useEffect(() => {
    localStorage.setItem('rocketbull_active_skin', activeSkin);
  }, [activeSkin]);

  useEffect(() => {
    localStorage.setItem('rocketbull_hud_mode', hudMode);
  }, [hudMode]);

  // Responsive scaling logic
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      const targetRatio = GAME_WIDTH / GAME_HEIGHT;
      const containerRatio = clientWidth / clientHeight;

      let newWidth, newHeight, newScale;

      if (containerRatio > targetRatio) {
        // Container is wider than game
        newHeight = clientHeight;
        newWidth = clientHeight * targetRatio;
        newScale = clientHeight / GAME_HEIGHT;
      } else {
        // Container is narrower than game
        newWidth = clientWidth;
        newHeight = clientWidth / targetRatio;
        newScale = clientWidth / GAME_WIDTH;
      }

      setDimensions({ width: newWidth, height: newHeight });
      setScale(newScale);
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    unlockedLevelsRef.current = unlockedLevels;
  }, [unlockedLevels]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
          // If we have a local highscore, sync it
          const localHigh = parseInt(localStorage.getItem('rocketbull_highscore') || '0', 10);
          if (localHigh > 0) {
              saveHighScore(u.uid, u.displayName || 'Anonymous Player', localHigh);
          }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchGlobalLeaderboard = async () => {
    const data = await getLeaderboard(5);
    setLeaderboard(data);
  };

  useEffect(() => {
    if (gameState === 'LOBBY') {
        fetchGlobalLeaderboard();
    }
  }, [gameState]);
  
  // Game World Refs (for performance)
  const playerRef = useRef<Player>({ ...INITIAL_PLAYER });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const birdsRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<Entity[]>([]);
  const coinsRef = useRef<{ id: string; x: number; y: number; width: number; height: number; type: string }[]>([]);
  const cloudsRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bossRef = useRef<Boss | null>(null);
  
  const spawnTimerRef = useRef(0);
  const birdSpawnTimerRef = useRef(0);
  const powerUpSpawnTimerRef = useRef(0);
  const coinSpawnTimerRef = useRef(0);
  const normalBirdCounterRef = useRef(0);
  const scrollRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const zeusCooldownRef = useRef(0);

  // Sound Synthesis
  const playDeathSound = useCallback(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Part 1: Impact Crunch
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.3, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(nGain);
    nGain.connect(ctx.destination);

    // Part 2: Descending "Game Over" Tones (Wa-wa-wa-waaaa)
    const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, start + duration);
        
        g.gain.setValueAtTime(0.2, start);
        g.gain.linearRampToValueAtTime(0, start + duration);
        
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
    };

    playTone(392.00, now, 0.1); // G4
    playTone(349.23, now + 0.15, 0.1); // F4
    playTone(311.13, now + 0.3, 0.1); // Eb4
    playTone(246.94, now + 0.45, 0.5); // B3 (long falling finish)

    noise.start(now);
  }, [soundEnabled]);

  const playPowerUpSound = useCallback(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.linearRampToValueAtTime(1046.50, now + 0.1); // C6
    osc.frequency.linearRampToValueAtTime(1567.98, now + 0.2); // G6

    g.gain.setValueAtTime(0.2, now);
    g.gain.linearRampToValueAtTime(0, now + 0.3);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }, [soundEnabled]);

  const playRocketSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // 1. Combustion Rumbling Noise (Rocket exhaust simulation)
      const duration = 1.35;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35); // Fast sweep up in frequencies
      filter.frequency.exponentialRampToValueAtTime(120, now + duration); // Dwindles away
      filter.Q.setValueAtTime(6, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.25);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, now + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // 2. High-speed Rocket Whining Jet Oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, now);
      osc1.frequency.exponentialRampToValueAtTime(1500, now + 0.45); // Ascending pitch
      osc1.frequency.exponentialRampToValueAtTime(300, now + duration);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(80, now);
      osc2.frequency.exponentialRampToValueAtTime(1900, now + 0.5); // Ascending pitch (harmony)
      osc2.frequency.exponentialRampToValueAtTime(380, now + duration);

      oscGain.gain.setValueAtTime(0.12, now);
      oscGain.gain.linearRampToValueAtTime(0.2, now + 0.25);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn("Failed playing custom rocket sound:", e);
    }
  }, [soundEnabled]);

  const playCoinSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      g.gain.setValueAtTime(0.12, now);
      g.gain.linearRampToValueAtTime(0, now + 0.22);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch (e) {}
  }, [soundEnabled]);

  const playThunderSound = useCallback(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Part 1: White Noise crackling blast
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    noise.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);

    // Part 2: Low synthesizer pitch sweep
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    g.gain.setValueAtTime(0.35, now);
    g.gain.linearRampToValueAtTime(0, now + 0.45);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.45);
  }, [soundEnabled]);

  const playHealSound = useCallback(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6

    g.gain.setValueAtTime(0.3, now);
    g.gain.linearRampToValueAtTime(0, now + 0.2);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }, [soundEnabled]);

  const playVictorySound = useCallback(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    const playNote = (freq: number, time: number, duration: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        g.gain.setValueAtTime(0.2, time);
        g.gain.linearRampToValueAtTime(0, time + duration);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
    };

    // Arpeggio C Major
    playNote(523.25, now, 0.1);    // C5
    playNote(659.25, now + 0.1, 0.1); // E5
    playNote(783.99, now + 0.2, 0.1); // G5
    playNote(1046.50, now + 0.3, 0.5); // C6
  }, [soundEnabled]);

  const playReflectSound = useCallback(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6

    g.gain.setValueAtTime(0.2, now);
    g.gain.linearRampToValueAtTime(0, now + 0.12);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.12);
  }, [soundEnabled]);

  useEffect(() => {
    if (gameState === 'SPLASH') {
      const timer = setTimeout(() => {
        setGameState('LOBBY');
      }, 3000); // 3 seconds splash
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'GAMEOVER' || gameState === 'VICTORY') {
      const finalScore = Math.floor(scoreRef.current);
      if (gameMode !== 'MULTIPLAYER') {
        setTotalMatches(v => {
          const next = v + 1;
          localStorage.setItem('rocketbull_total_matches', next.toString());
          return next;
        });
        if (finalScore > 0) {
          setScoreHistory(prev => {
            // Prevent duplicate records for the exact same transaction within a single turn
            if (prev.length > 0 && prev[prev.length - 1] === finalScore) {
              return prev;
            }
            const next = [...prev, finalScore].slice(-10);
            localStorage.setItem('rocketbull_score_history', JSON.stringify(next));
            return next;
          });
        }
      }
    }
  }, [gameState, gameMode]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('rocketbull_sound_enabled', next.toString());
      return next;
    });
  };

  const setCredits = useCallback((val: number | ((prev: number) => number)) => {
    setCreditsState(prev => {
      let nextRaw: number;
      if (typeof val === 'function') {
        nextRaw = val(prev);
      } else {
        nextRaw = val;
      }
      const added = nextRaw - prev;
      if (added > 0) {
        // Apply passive gain multipliers from current skin or buyable combat units!
        let mult = 1.0;
        
        // Active Skin Passive Multipliers
        if (activeSkin === 'COOL') mult += 0.10;
        if (activeSkin === 'GOLDEN') mult += 0.35;
        if (activeSkin === 'RAINBOW_NEON') mult += 0.50;
        if (activeSkin === 'SECRET_ZEUS') mult += 0.60;
        
        // Standard combat unit passive multipliers
        boughtEnemies.forEach(id => {
          const matched = BUYABLE_ENEMIES.find(e => e.id === id);
          if (matched) mult += matched.mult;
        });

        const finalAdded = Math.round(added * mult);
        const finalCredits = prev + finalAdded;

        // Automatically earn proportional flight XP alongside credits
        addXp(Math.max(1, Math.round(finalAdded * 0.04)));

        localStorage.setItem('rocketbull_credits', finalCredits.toString());
        return finalCredits;
      } else {
        localStorage.setItem('rocketbull_credits', nextRaw.toString());
        return nextRaw;
      }
    });
  }, [activeSkin, boughtEnemies, addXp]);

  const buyEnemy = useCallback((enemy: BuyableEnemy) => {
    if (boughtEnemies.includes(enemy.id)) return;
    if (credits < enemy.cost) return;

    const nextBought = [...boughtEnemies, enemy.id];
    setBoughtEnemies(nextBought);
    localStorage.setItem('rocketbull_bought_enemies', JSON.stringify(nextBought));

    // Subtract credits directly using setCreditsState
    setCreditsState(prev => {
      const nextCredits = prev - enemy.cost;
      localStorage.setItem('rocketbull_credits', nextCredits.toString());
      return nextCredits;
    });

    // Earn compact 2% capture XP bonus instantly!
    addXp(Math.round(enemy.cost * 0.02));

    try {
      playPowerUpSound();
    } catch (e) {}
  }, [boughtEnemies, credits, addXp, playPowerUpSound]);

  const toggleMusic = () => {
    setMusicEnabled(prev => {
      const next = !prev;
      localStorage.setItem('rocketbull_music_enabled', next.toString());
      return next;
    });
  };

  const applyPromoCode = (inputCode: string) => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) return;

    const isSingleUse = [
      'COWPOWER', 'SUPERTORITO', 'NEONRIDER', 'RGBFORCE',
      'CHULETA', 'TOROPILOTO', 'VOLADOR', 'MINITORO', 'COSMOS', 'RAPIDITO'
    ].includes(cleanCode);
    if (isSingleUse) {
      if (localStorage.getItem(`rocketbull_promo_used_${cleanCode}`) === 'true') {
        setPromoMsg({ text: '¡Código ya canjeado anteriormente!', success: false });
        return;
      }
    }

    if (cleanCode === 'COWPOWER') {
      const reward = 5000;
      setCredits(prev => {
        const next = prev + reward;
        localStorage.setItem('rocketbull_credits', next.toString());
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_COWPOWER`, 'true');
      setPromoMsg({ text: '¡Código COWPOWER canjeado! +5,000 Créditos 🐄', success: true });
    }
    else if (cleanCode === 'SUPERTORITO') {
      const reward = 15000;
      setCredits(prev => {
        const next = prev + reward;
        localStorage.setItem('rocketbull_credits', next.toString());
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_SUPERTORITO`, 'true');
      setPromoMsg({ text: '¡Código SUPERTORITO canjeado! +15,000 Créditos 👑', success: true });
    }
    else if (cleanCode === 'CHULETA') {
      const reward = 2500;
      setCredits(prev => {
        const next = prev + reward;
        localStorage.setItem('rocketbull_credits', next.toString());
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_CHULETA`, 'true');
      setPromoMsg({ text: '¡Código CHULETA canjeado! +2,500 Créditos 🥩', success: true });
    }
    else if (cleanCode === 'TOROPILOTO') {
      const targetSkin: SkinType = 'COOL';
      setUnlockedSkins(prev => {
        if (prev.includes(targetSkin)) return prev;
        const next = [...prev, targetSkin];
        localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(next));
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_TOROPILOTO`, 'true');
      setPromoMsg({ text: '¡Código TOROPILOTO canjeado! Skin Agente Secreto Desbloqueada 🕶️', success: true });
    }
    else if (cleanCode === 'VOLADOR') {
      const targetSkin: SkinType = 'PIG';
      setUnlockedSkins(prev => {
        if (prev.includes(targetSkin)) return prev;
        const next = [...prev, targetSkin];
        localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(next));
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_VOLADOR`, 'true');
      setPromoMsg({ text: '¡Código VOLADOR canjeado! Skin Propulsor Turbo Desbloqueada 🐷', success: true });
    }
    else if (cleanCode === 'MINITORO') {
      const targetSkin: SkinType = 'CHICKEN';
      setUnlockedSkins(prev => {
        if (prev.includes(targetSkin)) return prev;
        const next = [...prev, targetSkin];
        localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(next));
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_MINITORO`, 'true');
      setPromoMsg({ text: '¡Código MINITORO canjeado! Skin Aviador Veloz Desbloqueada 🐔', success: true });
    }
    else if (cleanCode === 'COSMOS') {
      const targetSkin: SkinType = 'CAT';
      setUnlockedSkins(prev => {
        if (prev.includes(targetSkin)) return prev;
        const next = [...prev, targetSkin];
        localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(next));
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_COSMOS`, 'true');
      setPromoMsg({ text: '¡Código COSMOS canjeado! Skin Fuerza Cósmica Desbloqueada 🐱', success: true });
    }
    else if (cleanCode === 'RAPIDITO') {
      const targetSkin: SkinType = 'SHARK';
      setUnlockedSkins(prev => {
        if (prev.includes(targetSkin)) return prev;
        const next = [...prev, targetSkin];
        localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(next));
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_RAPIDITO`, 'true');
      setPromoMsg({ text: '¡Código RAPIDITO canjeado! Skin Aero-Depredador Desbloqueada 🦈', success: true });
    }
    else if (cleanCode === 'NEONRIDER') {
      const targetSkin: SkinType = 'CYBER_PUNK';
      setUnlockedSkins(prev => {
        if (prev.includes(targetSkin)) return prev;
        const next = [...prev, targetSkin];
        localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(next));
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_NEONRIDER`, 'true');
      setPromoMsg({ text: '¡Código NEONRIDER canjeado! Skin Cyberpunk Desbloqueada 🕶️', success: true });
    }
    else if (cleanCode === 'RGBFORCE') {
      const targetSkin: SkinType = 'RAINBOW_NEON';
      setUnlockedSkins(prev => {
        if (prev.includes(targetSkin)) return prev;
        const next = [...prev, targetSkin];
        localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(next));
        return next;
      });
      localStorage.setItem(`rocketbull_promo_used_RGBFORCE`, 'true');
      setPromoMsg({ text: '¡Código RGBFORCE canjeado! Skin Elite RGB Neon Desbloqueada 🌈', success: true });
    }
    else {
      setPromoMsg({ text: '¡Código incorrecto o inválido!', success: false });
    }

    setPromoCode('');
  };

  const selectLevel = (l: number) => {
    if (l <= unlockedLevels) {
      setLevel(l);
      resetGame();
    }
  };

  const claimDailyReward = () => {
    if (!isDailyClaimable) return;
    
    let nextStreak = claimStreak + 1;
    if (nextStreak > 7) {
      nextStreak = 1;
    }
    
    const rewardConfigs = [
      { reward: 150, skin: null },
      { reward: 300, skin: null },
      { reward: 500, skin: null },
      { reward: 750, skin: null },
      { reward: 1000, skin: null },
      { reward: 1500, skin: null },
      { reward: 3000, skin: 'ALIEN' as SkinType }
    ];
    
    const targetReward = rewardConfigs[nextStreak - 1];
    
    let newCredits = credits + targetReward.reward;
    setCredits(newCredits);
    localStorage.setItem('rocketbull_credits', newCredits.toString());
    
    if (targetReward.skin && !unlockedSkins.includes(targetReward.skin)) {
      const nextSkins = [...unlockedSkins, targetReward.skin];
      setUnlockedSkins(nextSkins);
      localStorage.setItem('rocketbull_unlocked_skins', JSON.stringify(nextSkins));
    }
    
    setClaimStreak(nextStreak);
    setLastClaimTime(Date.now());
    localStorage.setItem('rocketbull_claim_streak', nextStreak.toString());
    localStorage.setItem('rocketbull_last_claim_time', Date.now().toString());
    setIsDailyClaimable(false);
    
    // Confetti particles
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        id: `confetti-${Date.now()}-${i}`,
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        life: 1.0,
        maxLife: 1.0,
        color: i % 2 === 0 ? '#fffa65' : '#00ffcc',
        size: 3 + Math.random() * 4,
        type: 'spark'
      });
    }
    
    try {
      playPowerUpSound();
    } catch (e) {}
  };

  const claimMission = (id: string, reward: number) => {
    if (claimedMissions.includes(id)) return;
    
    const nextClaimed = [...claimedMissions, id];
    setClaimedMissions(nextClaimed);
    localStorage.setItem('rocketbull_claimed_missions', JSON.stringify(nextClaimed));
    
    const nextCredits = credits + reward;
    setCredits(nextCredits);
    localStorage.setItem('rocketbull_credits', nextCredits.toString());
    
    // High grade victory sparks
    for (let i = 0; i < 30; i++) {
      particlesRef.current.push({
        id: `sparkle-${Date.now()}-${i}`,
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 0.8,
        maxLife: 0.8,
        color: '#fbbf24',
        size: 3 + Math.random() * 3,
        type: 'spark'
      });
    }
    
    try {
      playPowerUpSound();
    } catch(e){}
  };

  const resetGame = useCallback(() => {
    const config = AI_DIFFICULTIES[aiDifficulty];
    const livesCount = config ? config.lives : 3;
    aiLivesRef.current = livesCount;
    setAiLives(livesCount);

    birdCooldownRef.current = 0;
    setBirdCooldown(0);
    
    // In multiplayer duel, cow starts with standard 3 lives or depending on active skin bonus
    const initialLives = activeSkin === 'SECRET_ZEUS' ? 4 : 3;
    
    playerRef.current = { 
      ...INITIAL_PLAYER, 
      lives: initialLives,
      skin: activeSkin,
      invulnTimer: 3000, // Grant 3 seconds of initial level immunity
      // Place the cow gently on the left with high vertical clearance
      x: (gameMode === 'AI_DODGE' || gameMode === 'MULTIPLAYER') ? 100 : 150
    };
    obstaclesRef.current = [];
    birdsRef.current = [];
    powerUpsRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    bossRef.current = null;
    spawnTimerRef.current = 0;
    birdSpawnTimerRef.current = 0;
    powerUpSpawnTimerRef.current = 0;
    coinSpawnTimerRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setSessionReward(0);
    
    // Multiplayer specific resets
    chaosPointsRef.current = 50;
    setChaosPoints(50);
    setMultiplayerWinner('NONE');
    
    setGameState('PLAYING');
  }, [activeSkin, gameMode, aiDifficulty, setSessionReward]);

  const playSpawnSound = useCallback(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now); // E4
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1); // A4

    g.gain.setValueAtTime(0.12, now);
    g.gain.linearRampToValueAtTime(0, now + 0.12);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.12);
  }, [soundEnabled]);

  const spawnMultiplayerEnemy = useCallback((targetY: number) => {
    if (gameState !== 'PLAYING') return;

    // Check if boss is alive
    const isBossActive = bossRef.current && bossRef.current.state === 'active';

    if (isBossActive) {
      if (chaosPointsRef.current < 12) return;
      chaosPointsRef.current -= 12;
      setChaosPoints(Math.floor(chaosPointsRef.current));

      const boss = bossRef.current!;
      playSpawnSound();

      obstaclesRef.current.push({
        id: `mp-boss-projectile-${Date.now()}-${Math.random()}`,
        x: boss.x - 30,
        y: boss.y + 10,
        width: 32,
        height: 32,
        speed: 12, // fast firing
        variation: boss.id === 'flappy-king-boss' ? 2 : boss.id === 'astro-invader-boss' ? 3 : 1,
        type: 'obstacle',
        isBossProjectile: true,
        reflected: false,
        variationY: (targetY - (boss.y + 10)) / 45 // Drift vertically towards target Y
      });

      for (let i = 0; i < 6; i++) {
        particlesRef.current.push({
          id: `p-mpboss-${Date.now()}-${i}`,
          x: boss.x - 30,
          y: boss.y + 10,
          vx: -5 - Math.random() * 5,
          vy: (Math.random() - 0.5) * 6,
          life: 0.6,
          maxLife: 0.6,
          color: '#ff7675',
          size: 2 + Math.random() * 4
        });
      }
      return;
    }

    // Normal bird spawning
    const birdCosts = {
      yellow: 12,
      cool: 20,
      ninja: 30,
      kamikaze: 35,
      grenadier: 50
    };

    const cost = birdCosts[selectedMultiplayerBird];
    if (chaosPointsRef.current < cost) return;

    chaosPointsRef.current -= cost;
    setChaosPoints(Math.floor(chaosPointsRef.current));

    playSpawnSound();

    let variantSp: any = selectedMultiplayerBird;
    let speedMult = 2.5;
    if (variantSp === 'cool') speedMult = 3.5;
    else if (variantSp === 'ninja') speedMult = 4.5;
    else if (variantSp === 'kamikaze') speedMult = 6.2;
    else if (variantSp === 'fire-bat') speedMult = 5.2;
    else if (variantSp === 'grenadier') speedMult = 2.1;

    const baseSpeedMultiplier = 1 + (scoreRef.current / 3500);
    const normalSpeedRef = 5.5 * baseSpeedMultiplier;

    birdsRef.current.push({
      id: `mp-bird-${Date.now()}-${Math.random()}`,
      x: GAME_WIDTH + 30,
      y: targetY,
      width: 32,
      height: 32,
      speed: normalSpeedRef + speedMult,
      variant: variantSp,
      variation: 0,
      type: 'bird'
    });

    for (let i = 0; i < 6; i++) {
      particlesRef.current.push({
        id: `p-mp-be-${Date.now()}-${i}`,
        x: GAME_WIDTH,
        y: targetY,
        vx: -3 - Math.random() * 4,
        vy: (Math.random() - 0.5) * 5,
        life: 0.8,
        maxLife: 0.8,
        color: '#f1c40f',
        size: 2 + Math.random() * 3
      });
    }
  }, [gameState, selectedMultiplayerBird, playSpawnSound]);

  const summonMultiplayerBoss = useCallback(() => {
    if (gameState !== 'PLAYING' || gameMode !== 'MULTIPLAYER') return;
    if (bossRef.current) return;

    if (chaosPointsRef.current < 100) return;
    chaosPointsRef.current -= 100;
    setChaosPoints(Math.floor(chaosPointsRef.current));

    playThunderSound();

    const bossChoices = ['flappy-king-boss', 'astro-invader-boss', 'chrome-dino-boss', 'zeus-colossal-vaca-boss'];
    const bossId = bossChoices[Math.floor(Math.random() * bossChoices.length)];

    let maxHp = 30; // multiplayer boss health
    let vy = 2.5;

    bossRef.current = {
      id: bossId,
      x: GAME_WIDTH + 150,
      y: GAME_HEIGHT / 2,
      width: 100,
      height: 100,
      vy: vy,
      hp: maxHp,
      maxHp: maxHp,
      direction: 1,
      shootTimer: 0,
      state: 'entering',
      type: 'boss'
    };

    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        id: `p-boss-ent-${Date.now()}-${i}`,
        x: GAME_WIDTH - 50,
        y: GAME_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1.0,
        maxLife: 1.0,
        color: '#9b59b6',
        size: 3 + Math.random() * 5
      });
    }
  }, [gameState, gameMode, playThunderSound]);

  const handleInput = useCallback((e?: React.PointerEvent | KeyboardEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (gameState === 'LOBBY') {
      // Logic handled by buttons now
    } else if (gameState === 'PLAYING') {
      if (gameMode === 'AI_DODGE') {
        if (birdCooldownRef.current > 0) return;

        const canvas = canvasRef.current;
        let clickY = Math.random() * (GAME_HEIGHT - 120) + 60;
        
        if (e && 'clientY' in e && canvas) {
          const rect = canvas.getBoundingClientRect();
          clickY = ((e.clientY - rect.top) / rect.height) * GAME_HEIGHT;
        }

        // Spawn a bird on the right side traveling left from the purchased enemies pool!
        let selectedVariant = 'yellow';
        let speed = 6.5;
        if (boughtEnemies && boughtEnemies.length > 0) {
             selectedVariant = boughtEnemies[Math.floor(Math.random() * boughtEnemies.length)];
        }
        
        if (selectedVariant === 'cool') speed = 7.5;
        else if (selectedVariant === 'ninja') speed = 8.5;
        else if (selectedVariant === 'kamikaze') speed = 10.0;
        else if (selectedVariant === 'fire-bat') speed = 9.0;
        else if (selectedVariant === 'grenadier') speed = 6.0;
        else if (selectedVariant === 'ghost') speed = 5.0;
        else if (selectedVariant === 'robo-copter') speed = 9.5;

        birdsRef.current.push({
          id: `projectile-${Date.now()}-${Math.random()}`,
          x: GAME_WIDTH + 20,
          y: clickY,
          width: 32,
          height: 32,
          speed: speed,
          variant: selectedVariant,
          type: 'obstacle'
        });

        playSpawnSound();
        
        // Activate cooldown
        birdCooldownRef.current = 320; // 320ms (much faster shooting rate)
        setBirdCooldown(100);

        // Emit launch particles on the right edge
        for (let i = 0; i < 6; i++) {
          particlesRef.current.push({
            x: GAME_WIDTH,
            y: clickY,
            vx: -3 - Math.random() * 4,
            vy: (Math.random() - 0.5) * 5,
            life: 0.8,
            maxLife: 0.8,
            color: '#f1c40f',
            size: 2 + Math.random() * 3
          });
        }
      } else if (gameMode === 'MULTIPLAYER') {
        const canvas = canvasRef.current;
        let clickX = GAME_WIDTH / 4; // default left side
        let clickY = Math.random() * (GAME_HEIGHT - 120) + 60;

        if (e && 'clientX' in e && canvas) {
          const rect = canvas.getBoundingClientRect();
          clickX = ((e.clientX - rect.left) / rect.width) * GAME_WIDTH;
          clickY = ((e.clientY - rect.top) / rect.height) * GAME_HEIGHT;
        }

        // Left half triggers Player 1 Cow Thrust, Right half triggers Player 2 Birds Spawn
        if (clickX < GAME_WIDTH / 2) {
          playerRef.current.vy = THRUST;
          const color = playerRef.current.hasPower ? '#00cec9' : '#ff7675';
          for (let i = 0; i < 5; i++) {
            particlesRef.current.push({
              x: playerRef.current.x - 20,
              y: playerRef.current.y,
              vx: -2 - Math.random() * 3,
              vy: (Math.random() - 0.5) * 4,
              life: 1,
              maxLife: 1,
              color: color,
              size: 2 + Math.random() * 4
            });
          }
        } else {
          spawnMultiplayerEnemy(clickY);
        }
      } else {
        playerRef.current.vy = THRUST;
        // Emit thrust particles
        const color = playerRef.current.hasPower ? '#00cec9' : '#ff7675';
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: playerRef.current.x - 20,
            y: playerRef.current.y,
            vx: -2 - Math.random() * 3,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            maxLife: 1,
            color: color,
            size: 2 + Math.random() * 4
          });
        }
      }
    } else if (gameState === 'GAMEOVER' || gameState === 'VICTORY') {
      resetGame();
    }
  }, [gameState, resetGame, gameMode, playSpawnSound, spawnMultiplayerEnemy]);

  const triggerZeusLightning = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (activeSkin !== 'SECRET_ZEUS') return;
    if (zeusCooldownRef.current > 0) return;

    zeusCooldownRef.current = 15;
    setZeusCooldown(15);

    try {
      playThunderSound();
    } catch (e) {}

    const screenWidth = GAME_WIDTH;
    const playerX = playerRef.current.x;

    // Vaporize Obstacles
    if (obstaclesRef.current) {
      const remaining: Obstacle[] = [];
      obstaclesRef.current.forEach(ob => {
        if (ob.x > playerX - 30 && ob.x < screenWidth) {
          // Explode
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
              id: `p-elec-${Date.now()}-${Math.random()}-${i}`,
              x: ob.x,
              y: ob.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 0.6,
              maxLife: 0.6,
              color: '#00ffff',
              size: 2 + Math.random() * 3
            });
          }
        } else {
          remaining.push(ob);
        }
      });
      obstaclesRef.current = remaining;
    }

    // Vaporize Birds
    if (birdsRef.current) {
      const remaining: Obstacle[] = [];
      birdsRef.current.forEach(b => {
        if (b.x > playerX - 30 && b.x < screenWidth) {
          // Explode
          for (let i = 0; i < 12; i++) {
            particlesRef.current.push({
              id: `p-elec-${Date.now()}-${Math.random()}-${i}`,
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 0.7,
              maxLife: 0.7,
              color: '#f1c40f',
              size: 2.5 + Math.random() * 3.5
            });
          }
          scoreRef.current += 100;
          addXp(5);
        } else {
          remaining.push(b);
        }
      });
      birdsRef.current = remaining;
    }

    // Massive Boss Strike
    if (bossRef.current && bossRef.current.state === 'active') {
      bossRef.current.hp = Math.max(0, bossRef.current.hp - 20);
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          id: `p-boss-hit-${Date.now()}-${Math.random()}-${i}`,
          x: bossRef.current.x + (Math.random() - 0.5) * bossRef.current.width,
          y: bossRef.current.y + (Math.random() - 0.5) * bossRef.current.height,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 0.9,
          maxLife: 0.9,
          color: '#ffffff',
          size: 3 + Math.random() * 3
        });
      }
    }

    // Spawn zig-zag lightning graphics across the sky
    const segmentCount = 18;
    for (let s = 0; s < segmentCount; s++) {
      const segX = playerX + (s * (screenWidth - playerX) / segmentCount);
      const segY = playerRef.current.y + (Math.sin(s * 1.5) * 25);
      
      for (let j = 0; j < 3; j++) {
        particlesRef.current.push({
          id: `p-ray-${Date.now()}-${s}-${j}`,
          x: segX,
          y: segY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 0.35,
          maxLife: 0.35,
          color: '#00FFF0',
          size: 3 + Math.random() * 5
        });
      }
    }
  }, [gameState, activeSkin, addXp, playThunderSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
        }
        handleInput();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        setGameState(current => {
          if (current === 'PLAYING') return 'PAUSED';
          if (current === 'PAUSED') return 'PLAYING';
          return current;
        });
      } else if (e.code === 'KeyS' || e.code === 'KeyF') {
        e.preventDefault();
        triggerZeusLightning();
      }

      // Player 2 controls (Multiplayer Chaos Spawning)
      if (gameMode === 'MULTIPLAYER' && gameState === 'PLAYING') {
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
          setSelectedMultiplayerBird('yellow');
        } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
          setSelectedMultiplayerBird('cool');
        } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
          setSelectedMultiplayerBird('ninja');
        } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
          setSelectedMultiplayerBird('kamikaze');
        } else if (e.code === 'Digit5' || e.code === 'Numpad5') {
          setSelectedMultiplayerBird('grenadier');
        } else if (e.code === 'Digit6' || e.code === 'KeyB' || e.code === 'Numpad6' || e.code === 'Enter') {
          e.preventDefault();
          summonMultiplayerBoss();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, triggerZeusLightning, gameMode, gameState, summonMultiplayerBoss]);

  // Retro background arpeggio music synthesizer
  useEffect(() => {
    if (!musicEnabled || gameState !== 'PLAYING' || isCustomMusicActive) return;

    let isPlaying = true;
    let timerId: any = null;
    let noteIndex = 0;

    // C minor techno arpeggio notes
    const notes = [65.41, 77.78, 98.00, 116.54, 130.81, 116.54, 98.00, 77.78];

    const playBeat = () => {
      if (!isPlaying) return;

      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = noteIndex % 3 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(notes[noteIndex], now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180 + Math.sin(now) * 100, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);

        noteIndex = (noteIndex + 1) % notes.length;
      } catch (err) {
        console.warn("Background music play exception:", err);
      }

      timerId = setTimeout(playBeat, 240);
    };

    timerId = setTimeout(playBeat, 250);

    return () => {
      isPlaying = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [musicEnabled, gameState, isCustomMusicActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      handleInput(e as any);
    };

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [handleInput]);

  // Initial clouds
  useEffect(() => {
    const initialClouds: Entity[] = [];
    for (let i = 0; i < 5; i++) {
      initialClouds.push({
        id: `cloud-${i}`,
        x: Math.random() * GAME_WIDTH,
        y: 50 + Math.random() * 150,
        width: 80 + Math.random() * 40,
        height: 40,
        type: 'cloud'
      });
    }
    cloudsRef.current = initialClouds;
  }, []);

  const update = useCallback((delta: number) => {
    if (gameState !== 'PLAYING') {
        // Just draw current state (static)
        draw();
        return;
    }

    // Multiplayer Chaos regeneration: 22 Chaos Points per second
    if (gameMode === 'MULTIPLAYER') {
      chaosPointsRef.current = Math.min(100, chaosPointsRef.current + 22 * (delta / 1000));
      if (Math.floor(chaosPointsRef.current) !== chaosPoints) {
        setChaosPoints(Math.floor(chaosPointsRef.current));
      }
    }

    // Decrement bird cooldown smoothly during gameplay
    if (birdCooldownRef.current > 0) {
      const nextCd = Math.max(0, birdCooldownRef.current - delta);
      birdCooldownRef.current = nextCd;
      setBirdCooldown(Math.min(100, Math.max(0, (nextCd / 320) * 100)));
    }

    // Decrement Zeus ability cooldown smoothly (cooldown is stored in seconds)
    if (zeusCooldownRef.current > 0) {
      const nextZeusCd = Math.max(0, zeusCooldownRef.current - delta / 1000);
      zeusCooldownRef.current = nextZeusCd;
      setZeusCooldown(nextZeusCd);
    }

    const dt = delta / 16.67; // Normalize to 60fps
    const player = playerRef.current;
    const currentLevel = levelRef.current;
    const currentScore = scoreRef.current;
    
    // Level difficulty scaling + Score scaling (Cow speeds up as score increases!)
    let baseSpeedMultiplier = 1;
    if (gameMode === 'INFINITE') {
      baseSpeedMultiplier = 1 + (currentScore / 18000); // Gets faster infinitely!
    } else {
      // Scale with score up to the 2500 ("2.5k") level goal!
      // Closer it is to 2.5k points, the faster the cow goes without Cow Power! Accelerates progressively.
      const scoreProgress = Math.min(1.0, currentScore / 2500);
      const levelFactor = (currentLevel - 1) * 0.022; // Gentler progressive speed increase for higher levels
      const scoreFactor = Math.pow(scoreProgress, 1.2) * 2.0; // Slower progressive accelerator near the end of a level
      baseSpeedMultiplier = 1.1 + levelFactor + scoreFactor;
    }

    // 300+ Points Speedup Boost (Ramps up high-octane excitement dynamically from 300 points onwards in all levels/modes!)
    if (currentScore >= 300) {
      const scoreOver300 = currentScore - 300;
      // Multiplier starts at a nice 1.25x speed upgrade and builds up progressively as the score goes higher
      const extraSpeedBoost = 1.25 + Math.min(0.45, scoreOver300 / 1800);
      baseSpeedMultiplier *= extraSpeedBoost;
    }
    
    // Hardcore Mode Speed Modifier
    if (isHardcore) {
      baseSpeedMultiplier *= 1.45;
    }
    
    const boostMultiplier = player.hasPower ? 1.75 : 1; // Sightly nerfed Cow Power (from 2.5 to 1.75) for better control
    const currentSpeed = Math.min(45, OBSTACLE_SPEED * baseSpeedMultiplier * boostMultiplier);

    // Airspeed indicator
    const airspeedValue = Math.floor(currentSpeed * 20);

    // Victory Check (Ignored in Infinite Mode and AI Dodge Mode) - Set to exactly 2500 points!
    // In Boss levels (divisible by 5), the level does NOT end by score. You must defeat the boss to win.
    const targetScore = 2500;
    const isBossLevel = currentLevel % 5 === 0;
    if (gameMode === 'LEVELS' && currentScore >= targetScore && gameState === 'PLAYING' && !isBossLevel) {
        if (currentLevel === 80) {
            setHardcoreUnlocked(true);
            localStorage.setItem('rocketbull_hardcore_unlocked', 'true');
            setGameState('WORLD_DESTROY_PORTAL');
            playVictorySound();
            setCredits(c => {
                const next = c + 1500;
                localStorage.setItem('rocketbull_credits', next.toString());
                return next;
            });
            
            if (currentScore > highScoreRef.current) {
                setHighScore(Math.floor(currentScore));
                localStorage.setItem('rocketbull_highscore', Math.floor(currentScore).toString());
                if (user) {
                    saveHighScore(user.uid, user.displayName || 'Anonymous Player', Math.floor(currentScore));
                }
            }
        } else {
            setSessionReward(300);
            setGameState('VICTORY');
            playVictorySound();
            setCredits(c => c + 300); // 300 credits for passing each level!
            
            // Unlock next level if they pass the current level
            const nextLvl = Math.max(unlockedLevelsRef.current, currentLevel + 1);
            if (nextLvl > unlockedLevelsRef.current && nextLvl <= 80) {
                setUnlockedLevels(nextLvl);
                localStorage.setItem('rocketbull_unlocked_levels', nextLvl.toString());
            }
            
            // Save score if not already saved
            if (currentScore > highScoreRef.current) {
                setHighScore(Math.floor(currentScore));
                localStorage.setItem('rocketbull_highscore', Math.floor(currentScore).toString());
                if (user) {
                    saveHighScore(user.uid, user.displayName || 'Anonymous Player', Math.floor(currentScore));
                }
            }
        }
    }

    if (gameMode === 'MULTIPLAYER' && currentScore >= 2500 && gameState === 'PLAYING') {
      setMultiplayerWinner('COW');
      setSessionReward(150);
      setGameState('VICTORY');
      playVictorySound();
      setCredits(c => {
         const next = c + 1500;
         localStorage.setItem('rocketbull_credits', next.toString());
         return next;
      });
    }

    // AI Dodge Reflex Control
    if (gameMode === 'AI_DODGE' && gameState === 'PLAYING') {
      const currentDiff = aiDifficultyRef.current;
      const config = AI_DIFFICULTIES[currentDiff] || AI_DIFFICULTIES.FACIL;
      const range = config.reactionRange;

      // Balanced mistake and delays: FACIL has a 24% frame skip, MEDIO 14%, DIFICIL 8%, SUPREMO 3.5%
      const skipFrameChance = currentDiff === 'FACIL' ? 0.24 : (currentDiff === 'MEDIO' ? 0.14 : (currentDiff === 'DIFICIL' ? 0.08 : 0.035));
      const shouldCheck = Math.random() >= skipFrameChance;

      if (shouldCheck) {
        // Find nearest approaching bird projectile within the reaction range
        const threats = birdsRef.current.filter(b => b.x > player.x && b.x < player.x + range);
        if (threats.length > 0) {
          threats.sort((a, b) => a.x - b.x);
          const threat = threats[0];
          
          // Smart AI decision: if the player cow is above or within 15px below the threat, flap UP to stay above.
          // Otherwise, stay below and let gravity lower us.
          let goAbove = player.y < threat.y + 15;
          
          // Safety corrections for boundary proximity - Relaxed to allow touching the floor/ceiling
          if (!goAbove && player.y > GAME_HEIGHT - 38) {
            goAbove = true;
          }
          if (goAbove && player.y < -35) {
            goAbove = false;
          }

          if (goAbove) {
            // Stay above: safe target is threat.y - 60
            const targetY = threat.y - 60;
            if (player.y > targetY && player.vy > -3.0) {
              const thrustMult = currentDiff === 'SUPREMO' ? 1.15 : (currentDiff === 'DIFICIL' ? 1.05 : 0.95);
              player.vy = THRUST * thrustMult;
            }
          } else {
            // Stay below: allow gravity to drop.
            // But if we are falling near the floor, do gentle hovered flaps at the absolute last minute to prevent crashing.
            if (player.y > GAME_HEIGHT - 40 && player.vy > -1.2) {
              player.vy = THRUST * 0.7;
            }
          }
        } else {
          // Return gently to center height with cozy hovered flaps
          const targetY = GAME_HEIGHT / 2 - 20;
          if (player.y > targetY + 30) {
            if (player.vy > -1) {
              player.vy = THRUST * 0.65;
            }
          }
        }
      }
    }

    // 1. Gravity and Movement
    player.vy = Math.min(player.vy + GRAVITY * dt, TERMINAL_VELOCITY);
    player.y += player.vy * dt;
    player.rotation = Math.max(-0.5, Math.min(0.5, player.vy * 0.05));

    // Premium custom passive skin flight trails
    if (Math.random() < 0.45) {
      let particleColor = '#ff7675';
      let particleSize = 1.5 + Math.random() * 3;
      
      if (player.skin === 'CYBER_PUNK') {
        particleColor = Math.random() < 0.5 ? '#ff007f' : '#00f0ff';
      } else if (player.skin === 'MEGA_MECH') {
        particleColor = Math.random() < 0.5 ? '#ffa500' : '#888888';
      } else if (player.skin === 'SPATIAL_ASTRONAUT') {
        particleColor = Math.random() < 0.35 ? '#a29bfe' : (Math.random() < 0.5 ? '#ffffff' : '#6c5ce7');
        particleSize = 1 + Math.random() * 25;
      } else if (player.skin === 'RAINBOW_NEON') {
        const rainbowColors = ['#ff0000', '#ffaa00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
        particleColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
        particleSize = 2.5 + Math.random() * 2.5;
      }
      
      if (player.skin === 'CYBER_PUNK' || player.skin === 'MEGA_MECH' || player.skin === 'SPATIAL_ASTRONAUT' || player.skin === 'RAINBOW_NEON') {
        particlesRef.current.push({
          id: `p-skin-${Date.now()}-${Math.random()}`,
          x: player.x - 24,
          y: player.y + (Math.random() - 0.5) * 12,
          vx: -2.5 - Math.random() * 2,
          vy: (Math.random() - 0.5) * 1.5,
          life: 0.8,
          maxLife: 0.8,
          color: particleColor,
          size: Math.min(8, particleSize)
        });
      }
    }

    // Handle invulnerability countdown
    if (player.invulnTimer > 0) {
      player.invulnTimer = Math.max(0, player.invulnTimer - delta);
    }

    // 2. Bound checks - Allow player to cross/penetrate the ceiling and floor before taking damage
    const ceilingLimit = -player.height * 0.4;
    if (player.y <= ceilingLimit) {
      if (gameMode !== 'AI_DODGE') {
        if (!player.hasPower && player.invulnTimer <= 0) {
          handleHit();
        }
        player.y = ceilingLimit + 3;
        player.vy = Math.max(1.8, -player.vy * 0.4); // Bounce down
      } else {
        // En VS IA se puede tocar el techo con la vaca sin recibir daño ni rebotar bruscamente
        player.y = ceilingLimit;
        if (player.vy < 0) {
          player.vy = 0;
        }
      }
    }
    const groundLevel = GAME_HEIGHT - 40;
    const floorLimit = groundLevel + player.height * 0.2;
    if (player.y >= floorLimit) {
      if (!player.hasPower && player.invulnTimer <= 0) {
        handleHit();
      }
      player.y = floorLimit - 3;
      player.vy = Math.min(-3.2, -player.vy * 0.4); // Bounce up
    }

    // 3. Update Elements
    scrollRef.current = (scrollRef.current + currentSpeed * dt) % GAME_WIDTH;

    // Movement
    obstaclesRef.current.forEach(ob => {
      if (ob.reflected) {
        ob.x += (currentSpeed * 1.4) * dt; // Flies rightwards back at the boss!
      } else {
        ob.x -= currentSpeed * dt;
      }

      // If it is a dropped bomb, make it drop vertically
      if (ob.variant === 'bomb') {
        const bombVy = ob.vy || 3.5;
        ob.y += bombVy * dt;

        // Spawn beautiful dark magic bubble particles for the energy bomb!
        if (Math.random() < 0.25) {
          particlesRef.current.push({
            id: `p-bomb-${Date.now()}-${Math.random()}`,
            x: ob.x + 12,
            y: ob.y + 12,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0.4,
            maxLife: 0.4,
            color: '#9b59b6',
            size: 1.5 + Math.random() * 2
          });
        }
      }
    });
    birdsRef.current.forEach(b => {
        // Birds move faster than pipes, scaling with game speed
        let speedFactor = 1.5;
        if (player.hasPower && b.variant === 'cool') {
            // Cool glasses birds fly at the same relative speed as the background during Cow Power (feels same speed!)
            speedFactor = 1.0;
        }
        b.x -= (currentSpeed * speedFactor) * dt;

        // Custom variant flight paths
        if (b.variant === 'ninja') {
            // Tactical undulating wave
            b.y += Math.sin(b.x / 40) * 2.2 * dt;
        } else if (b.variant === 'fire-bat') {
            // Rapid twitchy bat flutter
            b.y += Math.cos(b.x / 15) * 1.6 * dt;
            
            // Spawn gorgeous spark trails from the fire bat!
            if (Math.random() < 0.15) {
                particlesRef.current.push({
                    id: `p-${Date.now()}-${Math.random()}`,
                    x: b.x + b.width / 2,
                    y: b.y + b.height / 2,
                    vx: 1 + Math.random() * 2,
                    vy: (Math.random() - 0.5) * 1.5,
                    life: 0.5,
                    maxLife: 0.5,
                    color: '#ff2d2d',
                    size: 1.5 + Math.random() * 2,
                    type: 'spark'
                });
            }
        } else if (b.variant === 'ghost') {
            // Slow, floaty hovering
            b.y += Math.sin(b.x / 100) * 1.0 * dt;
        } else if (b.variant === 'robo-copter') {
            // Advanced seeker mechanics: tracks the player's y-height gently as it flies!
            const playerY = player.y;
            const diffY = playerY - b.y;
            b.y += Math.sign(diffY) * 0.9 * dt;
        } else if (b.variant === 'kamikaze') {
            // Accelerates directly at player y-coordinate when extremely close
            const dx = b.x - player.x;
            if (dx > 0 && dx < 420) {
                const targetY = player.y;
                const diffY = targetY - b.y;
                b.y += Math.sign(diffY) * 3.5 * dt; // quick height lock on player
                b.x -= currentSpeed * 0.7 * dt;      // moves forward quicker relative to scroll
            } else {
                b.y += Math.sin(b.x / 30) * 1.2 * dt;
            }
            
            // Spark smoke trail
            if (Math.random() < 0.25) {
                particlesRef.current.push({
                    id: `p-kami-${Date.now()}-${Math.random()}`,
                    x: b.x + b.width / 2,
                    y: b.y + b.height / 2,
                    vx: 2 + Math.random() * 3,
                    vy: (Math.random() - 0.5) * 1.5,
                    life: 0.4,
                    maxLife: 0.4,
                    color: '#e67e22',
                    size: 2 + Math.random() * 2
                });
            }
        } else if (b.variant === 'grenadier') {
            // Gentle hovering slow flight
            b.y += Math.sin(b.x / 80) * 0.5 * dt;
            
            // Drop bomb timer
            if (b.shootCooldown === undefined) {
                b.shootCooldown = 40 + Math.random() * 80;
            }
            b.shootCooldown -= dt;
            if (b.shootCooldown <= 0) {
                b.shootCooldown = 130 + Math.random() * 100; // resets every 2.1 - 4 seconds
                obstaclesRef.current.push({
                    id: `bomb-${Date.now()}-${Math.random()}`,
                    x: b.x,
                    y: b.y + b.height + 5,
                    width: 25,
                    height: 25,
                    type: 'obstacle',
                    variant: 'bomb',
                    vy: 3.5,
                    vx: -2,
                    reflected: false,
                    isBossProjectile: false
                });
            }
        }

        // Prevent birds going entirely off top or bottom bounds
        if (b.y < 30) b.y = 30;
        if (b.y > GAME_HEIGHT - 70) b.y = GAME_HEIGHT - 70;
    });
    powerUpsRef.current.forEach(p => p.x -= currentSpeed * dt);
    coinsRef.current.forEach(c => c.x -= currentSpeed * dt);
    cloudsRef.current.forEach(c => {
        c.x -= (currentSpeed * 0.2) * dt;
        if (c.x < -100) c.x = GAME_WIDTH + 100;
    });

    // Cleanup (Allowing reflected projectiles to meet the boss on the right)
    obstaclesRef.current = obstaclesRef.current.filter(ob => ob.x > -100 && ob.x < GAME_WIDTH + 200);
    birdsRef.current = birdsRef.current.filter(b => b.x > -100);
    powerUpsRef.current = powerUpsRef.current.filter(p => p.x > -100);
    coinsRef.current = coinsRef.current.filter(c => c.x > -50);
    
    // Particles
    particlesRef.current.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.02 * dt;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 4. Spawning (Only enabled in LEVELS & INFINITE mode)
    if (gameMode !== 'AI_DODGE') {
      const isBossActive = (currentLevel % 5 === 0) && bossRef.current && bossRef.current.state === 'active';

      // "as que aparescan solo pajaros" -> Traditional pipe/column obstacles are completely disabled!
      const spawnPipes = false;
      const spawnRate = SPAWN_RATE / baseSpeedMultiplier;
      spawnTimerRef.current += delta;
      if (spawnPipes && spawnTimerRef.current > spawnRate && !isBossActive) {
        spawnTimerRef.current = 0;
        
        const spawnType = Math.random(); // 0-0.475: Top, 0.475-0.95: Bottom, 0.95-1: Both
        const gap = Math.max(140, 240 - (currentLevel * 1.5)); // Better balanced & playable gaps
        const minPipeHeight = 40;
        
        if (spawnType < 0.475) {
          // SINGLE TOP
          const h = 40 + Math.random() * (GAME_HEIGHT - 240);
          obstaclesRef.current.push({
            id: `obs-t-${Date.now()}`,
            x: GAME_WIDTH + 100,
            y: h / 2,
            width: 70,
            height: h,
            speed: currentSpeed,
            type: 'obstacle'
          });
        } else if (spawnType < 0.95) {
          // SINGLE BOTTOM
          const h = 40 + Math.random() * (GAME_HEIGHT - 240);
          obstaclesRef.current.push({
            id: `obs-b-${Date.now()}`,
            x: GAME_WIDTH + 100,
            y: GAME_HEIGHT - 40 - h / 2,
            width: 70,
            height: h,
            speed: currentSpeed,
            type: 'obstacle'
          });
        } else {
          // DOUBLE (EXTREMELY RARE - 5%)
          const topHeight = 40 + Math.random() * (GAME_HEIGHT - 40 - gap - 40);
          const bottomHeight = GAME_HEIGHT - 40 - topHeight - gap;
          
          obstaclesRef.current.push({
            id: `obs-dt-${Date.now()}`,
            x: GAME_WIDTH + 100,
            y: topHeight / 2,
            width: 70,
            height: topHeight,
            speed: currentSpeed,
            type: 'obstacle'
          });
          obstaclesRef.current.push({
            id: `obs-db-${Date.now()}`,
            x: GAME_WIDTH + 100,
            y: GAME_HEIGHT - 40 - bottomHeight / 2,
            width: 70,
            height: bottomHeight,
            speed: currentSpeed,
            type: 'obstacle'
          });
        }
      }

      // Balanced bird spawn rate (multiplied by 0.8) so birds spawn slightly less frequently
      const birdSpawnRate = (BIRD_SPAWN_RATE * 0.8) / baseSpeedMultiplier;
      birdSpawnTimerRef.current += delta;
      if (gameMode !== 'AI_DODGE' && gameMode !== 'MULTIPLAYER' && birdSpawnTimerRef.current > birdSpawnRate && !isBossActive) {
          birdSpawnTimerRef.current = 0;
          
          let variant: any = 'yellow';
          let speedMult = 2.5;
          
          if (playerRef.current.hasPower) {
              // Con Cow Power (poder de la vaca) activo, salen SI O SI todos con lentes
              variant = 'cool';
          } else {
              // Incrementar el contador secuencial para mantener el ratio exacto 2 normales, 1 con lentes
              normalBirdCounterRef.current += 1;
              if (normalBirdCounterRef.current >= 3) {
                  // Cada 3er pájaro es de lentes (cool)
                  variant = 'cool';
                  normalBirdCounterRef.current = 0; // Reiniciar contador
              } else {
                  // Los primeros 2 son normales (escoge todos excepto 'cool')
                  const pool: string[] = ['yellow'];
                  // Only spawn advanced birds if they have been bought in store/bestiary!
                  if (boughtEnemies.includes('ninja')) {
                      pool.push('ninja');
                  }
                  if (boughtEnemies.includes('kamikaze')) {
                      pool.push('kamikaze');
                  }
                  if (boughtEnemies.includes('fire-bat')) {
                      pool.push('fire-bat');
                  }
                  if (boughtEnemies.includes('grenadier')) {
                      pool.push('grenadier');
                  }
                  if (boughtEnemies.includes('ghost')) {
                      pool.push('ghost');
                  }
                  if (boughtEnemies.includes('robo-copter')) {
                      pool.push('robo-copter');
                  }
                  
                  variant = pool[Math.floor(Math.random() * pool.length)];
              }
          }
          
          if (variant === 'cool') speedMult = 2.5;
          else if (variant === 'ninja') speedMult = 3.2;
          else if (variant === 'kamikaze') speedMult = 4.2;
          else if (variant === 'fire-bat') speedMult = 3.8;
          else if (variant === 'grenadier') speedMult = 2.0;
          else if (variant === 'ghost') speedMult = 1.5;
          else if (variant === 'robo-copter') speedMult = 4.0;

          birdsRef.current.push({
              id: `bird-${Date.now()}`,
              x: GAME_WIDTH + 100,
              y: 30 + Math.random() * (GAME_HEIGHT - 100), // More spread out
              width: 32,
              height: 32,
              speed: currentSpeed + speedMult,
              variant: variant,
              variation: 0, // Set to 0 so we can distinguish if we want logic for it
              type: 'bird'
          });
      }

      powerUpSpawnTimerRef.current += delta;
      const powerRate = isBossActive ? 2500 : POWERUP_SPAWN_RATE;
      if (powerUpSpawnTimerRef.current > powerRate) {
          powerUpSpawnTimerRef.current = 0;
          powerUpsRef.current.push({
              id: `pwr-${Date.now()}`,
              x: GAME_WIDTH + 50,
              y: 100 + Math.random() * 280,
              width: 30,
              height: 30,
              type: 'powerup'
          });
      }

      // Dynamic golden coin spawning to balance play and reward system
      coinSpawnTimerRef.current += delta;
      const coinRate = 1500; // ms
      if (coinSpawnTimerRef.current > coinRate && !isBossActive) {
          coinSpawnTimerRef.current = 0;
          const coinPattern = Math.random();
          const randomY = 80 + Math.random() * (GAME_HEIGHT - 180);
          
          if (coinPattern < 0.45) {
              // Row of 3 coins
              for (let i = 0; i < 3; i++) {
                  coinsRef.current.push({
                      id: `coin-${Date.now()}-${i}-${Math.random()}`,
                      x: GAME_WIDTH + 60 + i * 45,
                      y: randomY,
                      width: 20,
                      height: 20,
                      type: 'coin'
                  });
              }
          } else if (coinPattern < 0.80) {
              // Diagonal of 4 coins
              for (let i = 0; i < 4; i++) {
                  coinsRef.current.push({
                      id: `coin-${Date.now()}-${i}-${Math.random()}`,
                      x: GAME_WIDTH + 60 + i * 45,
                      y: Math.min(GAME_HEIGHT - 60, Math.max(50, randomY + (i - 1.5) * 30)),
                      width: 20,
                      height: 20,
                      type: 'coin'
                  });
              }
          } else {
              // Single high value coin
              coinsRef.current.push({
                  id: `coin-${Date.now()}-${Math.random()}`,
                  x: GAME_WIDTH + 60,
                  y: randomY,
                  width: 20,
                  height: 20,
                  type: 'coin'
              });
          }
      }

      // --- BOSS EVERY 5 LEVELS TRIGGERS ---
      if (currentLevel % 5 === 0 && scoreRef.current >= 1800 && !bossRef.current) {
        let bossId = 'chrome-dino-boss';
        let baseHp = 6;
        let vy = 1.6 + (currentLevel * 0.03); // Speed increases dynamically with level

        const bossGroup = currentLevel % 20;
        if (bossGroup === 5) {
          bossId = 'chrome-dino-boss';
          baseHp = 6;
        } else if (bossGroup === 10) {
          bossId = 'flappy-king-boss';
          baseHp = 8;
        } else if (bossGroup === 15) {
          bossId = 'astro-invader-boss';
          baseHp = 10;
        } else if (bossGroup === 0) {
          bossId = 'zeus-colossal-vaca-boss';
          baseHp = 12;
        }

        // Scaled Max HP berdasarkan level:
        let maxHp = Math.round(baseHp + Math.floor(currentLevel / 5) * 1.5);

        // Hardcore bosses receive +50% HP
        if (isHardcore) {
          maxHp = Math.round(maxHp * 1.5);
        }

        bossRef.current = {
          id: bossId,
          x: GAME_WIDTH + 150,
          y: GAME_HEIGHT / 2,
          width: 100,
          height: 100,
          type: 'boss',
          hp: maxHp,
          maxHp: maxHp,
          vy: vy,
          direction: 1,
          state: 'entering',
          shootTimer: 0
        };

        // Clear existing screen threats to prepare a clean arena for the epic boss duel!
        birdsRef.current = [];
        obstaclesRef.current = [];
      }
    }

    // 5. Collisions
    const checkCollision = (a: Entity, b: Entity) => {
        // High-precision, forgiving collision bounds check to eradicate frustrating "medio roze" hits
        let marginA = 5;
        let marginB = 5;
        
        if (gameMode === 'AI_DODGE') {
            // Under VS AI mode, the AI Cow is the target so we don't shrink its hitbox.
            // In fact, we make it slightly more generous (padded) so the player's bird hits register smoothly!
            if (a.id === 'player') marginA = -4;
            if (b.id === 'player') marginB = -4;
        } else {
            // Standard Modes (Levels / Infinite) where the user plays as the cow:
            // Establish a generous 38% hitbox core reduction so narrow escapes feel rewarding!
            if (a.id === 'player') {
                marginA = Math.floor(a.width * 0.38);
            }
            if (b.id === 'player') {
                marginB = Math.floor(b.width * 0.38);
            }
        }
        
        return (
            (a.x - (a.width - marginA) / 2) < b.x + (b.width - marginB) / 2 &&
            (a.x + (a.width - marginA) / 2) > b.x - (b.width - marginB) / 2 &&
            (a.y - (a.height - marginA) / 2) < b.y + (b.height - marginB) / 2 &&
            (a.y + (a.height - marginA) / 2) > b.y - (b.height - marginB) / 2
        );
    };

    // --- BOSS AND CACTI GAME PLAY LOGIC ---
    const boss = bossRef.current;
    if (boss && boss.state !== 'defeated') {
      if (boss.state === 'entering') {
        boss.x -= 2 * dt;
        if (boss.x <= GAME_WIDTH - 150) {
          boss.state = 'active';
        }
      } else if (boss.state === 'active') {
        // Boss moves up and down
        boss.y += boss.vy * dt;
        if (boss.y < 80) {
          boss.y = 80;
          boss.vy = Math.abs(boss.vy);
        }
        if (boss.y > GAME_HEIGHT - 120) {
          boss.y = GAME_HEIGHT - 120;
          boss.vy = -Math.abs(boss.vy);
        }

        // Shoot items based on Active Boss
        boss.shootTimer += delta;
        const shootInterval = boss.id === 'astro-invader-boss' ? 1400 : boss.id === 'flappy-king-boss' ? 1600 : 1800;
        if (boss.shootTimer > shootInterval) {
          boss.shootTimer = 0;
          let variation = 1;
          let obsW = 30;
          let obsH = 48;
          let speedScale = 1.12;
          let pColor = '#535353';
          
          if (boss.id === 'flappy-king-boss') {
            variation = 2;
            obsW = 28;
            obsH = 34;
            speedScale = 1.25;
            pColor = '#fdcb6e';
          } else if (boss.id === 'astro-invader-boss') {
            variation = 3;
            obsW = 35;
            obsH = 15;
            speedScale = 1.4;
            pColor = '#ff55cc';
          }

          obstaclesRef.current.push({
            id: `projectile-${Date.now()}`,
            x: boss.x - 30,
            y: boss.y + 10,
            width: obsW,
            height: obsH,
            speed: currentSpeed * speedScale,
            variation: variation, // Draw proper variation
            type: 'obstacle',
            isBossProjectile: true,
            reflected: false
          });

          // Spurt launch particles
          for (let i = 0; i < 6; i++) {
            particlesRef.current.push({
              x: boss.x - 35,
              y: boss.y - 10,
              vx: -(2 + Math.random() * 3),
              vy: (Math.random() - 0.5) * 3,
              life: 0.8,
              maxLife: 0.8,
              color: pColor,
              size: 2 + Math.random() * 3
            });
          }
        }
      }

      // Check collision with player
      if (checkCollision(player, boss)) {
        if (player.hasPower) {
          boss.hp -= 1;
          playDeathSound();

          // Push player back & boss forward
          player.vy = -5;
          boss.x = Math.min(GAME_WIDTH - 50, boss.x + 20);

          // Hit sparks
          for (let i = 0; i < 15; i++) {
            particlesRef.current.push({
              x: player.x + (boss.x - player.x) / 2,
              y: player.y + (boss.y - player.y) / 2,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              life: 1,
              maxLife: 1,
              color: i % 2 === 0 ? '#535353' : '#ff7675',
              size: 2 + Math.random() * 4
            });
          }

          if (boss.hp <= 0) {
            boss.state = 'defeated';
            playVictorySound();

            setScore(s => s + 5000);
            setCredits(c => c + 1500);

            // Large explosion
            for (let i = 0; i < 40; i++) {
              particlesRef.current.push({
                x: boss.x,
                y: boss.y,
                vx: (Math.random() - 0.5) * 18,
                vy: (Math.random() - 0.5) * 18,
                life: 1,
                maxLife: 1,
                color: i % 3 === 0 ? '#535353' : i % 3 === 1 ? '#ff7675' : '#ffffff',
                size: 3 + Math.random() * 5
              });
            }

            // Defeated secret boss finishes the final level and yields victory screen
            if (currentLevel === 80) {
              setHardcoreUnlocked(true);
              localStorage.setItem('rocketbull_hardcore_unlocked', 'true');
              // Award massive credits
              setCredits(c => {
                const next = c + 1500;
                localStorage.setItem('rocketbull_credits', next.toString());
                return next;
              });
              setGameState('WORLD_DESTROY_PORTAL');
              bossRef.current = null;
            } else {
              // Unlocking next level and saving progress
              const nextLvl = Math.max(unlockedLevelsRef.current, currentLevel + 1);
              if (nextLvl > unlockedLevelsRef.current && nextLvl <= 80) {
                  setUnlockedLevels(nextLvl);
                  localStorage.setItem('rocketbull_unlocked_levels', nextLvl.toString());
              }
              setGameState('VICTORY');
              bossRef.current = null;
            }
          }
        } else {
          handleHit();
          // Avoid instant multi-hit dying by bouncing player back
          player.y += (player.y < boss.y) ? -40 : 40;
          player.vy = (player.y < boss.y) ? -6 : 6;
        }
      }
    }

    // Obstacles (Only active in normal/levels/infinite modes)
    if (gameMode !== 'AI_DODGE') {
      obstaclesRef.current.forEach(ob => {
          // 2. Collision with player
          if (checkCollision(player, ob)) {
              if (ob.isBossProjectile && player.hasPower && !ob.reflected) {
                  // Rocket is active: reflect back projectile physically on collision!
                  ob.reflected = true;
                  ob.y = player.y; // Align to player's rocket height
                  playReflectSound();
                  for (let i = 0; i < 8; i++) {
                    particlesRef.current.push({
                      x: ob.x,
                      y: ob.y,
                      vx: 5 + Math.random() * 5,
                      vy: (Math.random() - 0.5) * 5,
                      life: 0.7,
                      maxLife: 0.7,
                      color: '#55efc4',
                      size: 2.5 + Math.random() * 3
                    });
                  }
              } else if (!ob.reflected) {
                  if (!player.hasPower) {
                      handleHit();
                      // Avoid double trigger by removing obstacle
                      ob.x = -1000;
                  } else {
                      // Destroy standard cactus obstacle with shield
                      ob.x = -1000;
                      setScore(s => s + 50);
                      setCredits(c => c + 10);
                  }
              }
          }

          // 3. Hit Boss check (reflected projectile collides with boss)
          if (ob.reflected && boss && boss.state === 'active') {
              if (checkCollision(ob, boss)) {
                  const damageDealt = player.hasPower ? 2 : 1; // 2hp with rocket, 1hp with normal bounce
                  boss.hp -= damageDealt;
                  ob.x = -1000; // Destroy projectile on hit
                  playDeathSound();

                  // Splendid impact sparks
                  for (let i = 0; i < 15; i++) {
                    particlesRef.current.push({
                      x: boss.x - boss.width / 3,
                      y: ob.y,
                      vx: -(2 + Math.random() * 6),
                      vy: (Math.random() - 0.5) * 6,
                      life: 0.8,
                      maxLife: 0.8,
                      color: player.hasPower ? '#1dd1a1' : '#ff7675',
                      size: 2 + Math.random() * 4
                    });
                  }

                  if (boss.hp <= 0) {
                      boss.state = 'defeated';
                      playVictorySound();

                      setScore(s => s + 5000);
                      setSessionReward(1500);
                      setCredits(c => c + 1500);

                      // Big glorious explosion sparks
                      for (let i = 0; i < 40; i++) {
                        particlesRef.current.push({
                          x: boss.x,
                          y: boss.y,
                          vx: (Math.random() - 0.5) * 20,
                          vy: (Math.random() - 0.5) * 20,
                          life: 1.1,
                          maxLife: 1.1,
                          color: i % 3 === 0 ? '#ff7675' : i % 3 === 1 ? '#fffa65' : '#ffffff',
                          size: 3 + Math.random() * 5
                        });
                      }

                      if (currentLevel === 80) {
                          setHardcoreUnlocked(true);
                          localStorage.setItem('rocketbull_hardcore_unlocked', 'true');
                          // Award massive credits
                          setCredits(c => {
                            const next = c + 1500;
                            localStorage.setItem('rocketbull_credits', next.toString());
                            return next;
                          });
                          setGameState('WORLD_DESTROY_PORTAL');
                          bossRef.current = null;
                      } else {
                          // Unlocking next level and saving progress
                          const nextLvl = Math.max(unlockedLevelsRef.current, currentLevel + 1);
                          if (nextLvl > unlockedLevelsRef.current && nextLvl <= 80) {
                              setUnlockedLevels(nextLvl);
                              localStorage.setItem('rocketbull_unlocked_levels', nextLvl.toString());
                          }
                          setGameState('VICTORY');
                          bossRef.current = null;
                      }
                  }
              }
          }
      });
    }

    // Birds collision checks (AI Dodge Mode has custom reverse-hit detection)
    birdsRef.current.forEach(b => {
        if (checkCollision(player, b)) {
            if (gameMode === 'AI_DODGE') {
                b.x = -1000; // prevent dual hits
                aiLivesRef.current -= 1;
                setAiLives(aiLivesRef.current);
                playDeathSound();

                // Sparkles around the cow representing a hit connection
                for (let i = 0; i < 15; i++) {
                  particlesRef.current.push({
                    x: player.x,
                    y: player.y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 0.8,
                    maxLife: 0.8,
                    color: i % 2 === 0 ? '#ff7675' : '#ffffff',
                    size: 2.5 + Math.random() * 4
                  });
                }

                // If AI lives are completed, trigger victory
                if (aiLivesRef.current <= 0) {
                  // Player wins! Add dynamic reward coins/credits based on difficulty
                  const currentDiff = aiDifficultyRef.current;
                  const config = AI_DIFFICULTIES[currentDiff] || AI_DIFFICULTIES.FACIL;
                  const bonusReward = config.reward;

                  setSessionReward(bonusReward);
                  setCredits(c => {
                    const next = c + bonusReward;
                    localStorage.setItem('rocketbull_credits', next.toString());
                    return next;
                  });
                  playVictorySound();
                  setGameState('VICTORY');

                  // Huge glorious explosion
                  for (let i = 0; i < 40; i++) {
                    particlesRef.current.push({
                      x: player.x,
                      y: player.y,
                      vx: (Math.random() - 0.5) * 18,
                      vy: (Math.random() - 0.5) * 18,
                      life: 1.2,
                      maxLife: 1.2,
                      color: i % 3 === 0 ? '#e17055' : i % 3 === 1 ? '#ff7675' : '#ffffff',
                      size: 3 + Math.random() * 5
                    });
                  }
                }
            } else {
                // Standard mode flappy cow hitting a bird
                if (!player.hasPower) {
                    handleHit();
                    b.x = -1000;
                } else {
                    if (b.variant === 'cool') {
                        player.coolBirdsKilled += 1;
                        if (player.coolBirdsKilled >= 2) {
                            player.lives = Math.min(3, player.lives + 1);
                            player.coolBirdsKilled = 0;
                            playHealSound();
                        }
                    }
                    b.x = -1000;
                    setScore(s => s + 100);
                    setCredits(c => c + 25);
                    setBirdsDefeatedCount(prev => {
                      const next = prev + 1;
                      localStorage.setItem('rocketbull_mission_birds', next.toString());
                      return next;
                    });
                }
            }
        }
    });

    // Powerups (Only active in normal/levels/infinite modes)
    if (gameMode !== 'AI_DODGE') {
      powerUpsRef.current.forEach(p => {
          if (checkCollision(player, p)) {
              player.hasPower = true;
              player.powerTimer = 300; // ~5 seconds
              player.coolBirdsKilled = 0; // Reset counter when getting new power? Or keep? Let's keep one power duration.
              p.x = -1000;
              playRocketSound();
          }
      });

      // Coins collection (Only active in normal/levels/infinite modes)
      coinsRef.current.forEach(c => {
          if (checkCollision(player, c)) {
              const originalX = c.x;
              const originalY = c.y;
              c.x = -1000;
              playCoinSound();
              // Standard coin provides base +5 credits, magnified by skins and captured units
              setCredits(prev => prev + 5);
              
              // Spurt nice sparkling particles
              for (let i = 0; i < 6; i++) {
                particlesRef.current.push({
                  x: originalX,
                  y: originalY,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  life: 0.6,
                  maxLife: 0.6,
                  color: '#ffd700',
                  size: 2 + Math.random() * 2
                });
              }
          }
      });
    }

    if (player.hasPower) {
        player.powerTimer -= 1 * dt;
        
        // Extra boost particles
        if (Math.random() > 0.6) {
          particlesRef.current.push({
            x: player.x - 25,
            y: player.y + (Math.random() - 0.5) * 10,
            vx: -5 - Math.random() * 5,
            vy: (Math.random() - 0.5) * 2,
            life: 0.8,
            maxLife: 0.8,
            color: '#00cec9',
            size: 1 + Math.random() * 3
          });
        }

        if (player.powerTimer <= 0) {
            player.hasPower = false;
            player.coolBirdsKilled = 0; // Reset counter when power expires
        }
    }

    // Score update and dynamic XP accumulation (points accumulate faster as score increases!)
    const progressiveFactor = 1 + (scoreRef.current / 350);
    const scoreIncr = 0.15 * (player.hasDoublePoints ? 2 : 1) * progressiveFactor;
    scoreRef.current += scoreIncr;
    if (Math.floor(scoreRef.current) !== score) {
        const nextScore = Math.floor(scoreRef.current);
        setScore(nextScore);
        if (nextScore % 8 === 0) {
          addXp(1); // Gain XP for surviving and covering distance (now balanced, takes twice as long!)
        }
    }

    draw();
  }, [gameState, handleInput, user, playVictorySound, playDeathSound, playHealSound, playPowerUpSound, playRocketSound]);

  const handleHit = () => {
    if (playerRef.current.invulnTimer > 0) return;
    
    if (gameMode === 'AI_DODGE') {
      aiLivesRef.current -= 1;
      setAiLives(aiLivesRef.current);
      playerRef.current.invulnTimer = 800; // grace period for AI
      playDeathSound();
      
      // Explosion particles
      for (let i = 0; i < 15; i++) {
          particlesRef.current.push({
            x: playerRef.current.x,
            y: playerRef.current.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 0.8,
            maxLife: 0.8,
            color: '#ff7675',
            size: 2.5 + Math.random() * 4
          });
      }

      if (aiLivesRef.current <= 0) {
        const currentDiff = aiDifficultyRef.current;
        const config = AI_DIFFICULTIES[currentDiff] || AI_DIFFICULTIES.FACIL;
        const bonusReward = config.reward;

        setSessionReward(bonusReward);
        setCredits(c => {
          const next = c + bonusReward;
          localStorage.setItem('rocketbull_credits', next.toString());
          return next;
        });
        playVictorySound();
        setGameState('VICTORY');

        // Huge glorious explosion
        for (let i = 0; i < 40; i++) {
          particlesRef.current.push({
            x: playerRef.current.x,
            y: playerRef.current.y,
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() - 0.5) * 18,
            life: 1.2,
            maxLife: 1.2,
            color: i % 3 === 0 ? '#e17055' : i % 3 === 1 ? '#ff7675' : '#ffffff',
            size: 3 + Math.random() * 5
          });
        }
      }
      return;
    }
    
    playerRef.current.lives -= 1;
    playerRef.current.invulnTimer = 2000; // 2s invulnerability frame (grace period)
    playDeathSound();
    
    if (playerRef.current.lives <= 0) {
      if (gameMode === 'MULTIPLAYER') {
        setMultiplayerWinner('CHAOS');
        setGameState('GAMEOVER');
      } else {
        setGameState('GAMEOVER');
        const finalScore = scoreRef.current;
        if (finalScore > highScoreRef.current) {
          setHighScore(finalScore);
          localStorage.setItem('rocketbull_highscore', finalScore.toString());
          if (user) {
              saveHighScore(user.uid, user.displayName || 'Anonymous Player', finalScore);
          }
        }
      }
    }
    // Explosion particles
    for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          x: playerRef.current.x,
          y: playerRef.current.y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1,
          maxLife: 1,
          color: '#e17055',
          size: 3 + Math.random() * 5
        });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    const activeTheme = isHardcore ? 'HARDCORE_CHAOS' : undefined;
    drawSky(ctx, activeTheme);
    cloudsRef.current.forEach(c => drawCloud(ctx, c));
    drawGround(ctx, scrollRef.current, activeTheme);
    
    obstaclesRef.current.forEach(ob => drawObstacle(ctx, ob));
    birdsRef.current.forEach(b => drawBird(ctx, b));
    powerUpsRef.current.forEach(p => drawPowerUp(ctx, p));

    // Render golden coins with shiny 3D rotation and neon outer glow
    ctx.save();
    coinsRef.current.forEach(c => {
      if (c.x > -30 && c.x < GAME_WIDTH + 30) {
        const spinAngle = (Date.now() / 120) % (Math.PI * 2);
        const spinWidth = Math.max(2, Math.abs(Math.sin(spinAngle)) * 10);
        
        ctx.translate(c.x, c.y);
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(234,179,8,0.7)';
        
        ctx.fillStyle = '#f1c40f'; // Bright golden yellow
        ctx.strokeStyle = '#e67e22'; // Orange gold rim
        ctx.lineWidth = 1.8;
        
        ctx.beginPath();
        ctx.ellipse(0, 0, spinWidth, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1, spinWidth - 2.5), 7.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        if (spinWidth > 5) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('C', 0, 0.5);
        }
        ctx.translate(-c.x, -c.y);
      }
    });
    ctx.restore();

    particlesRef.current.forEach(p => drawParticle(ctx, p));
    
    if (bossRef.current) {
      drawBoss(ctx, bossRef.current);
    }
    
    drawBull(ctx, playerRef.current);
  };

  useGameLoop(update, true);

  return (
    <div 
      id="game-container" 
      ref={containerRef} 
      className={`relative w-full h-screen flex flex-col items-center justify-center overflow-hidden font-sans transition-all duration-1000 ${
        isHardcore 
          ? 'bg-gradient-to-br from-neutral-950 via-red-950/40 to-stone-950' 
          : 'bg-gradient-to-br from-[#0c0d1e] via-[#090915] to-[#1a0a2a]'
      }`}
    >
      {/* Glowing blurred background ornament spheres for premium design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className={`absolute -top-[10%] -left-[10%] w-[45%] h-[40%] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse transition-all duration-1000 ${
          isHardcore ? 'bg-red-700/60 shadow-[0_0_50px_rgba(185,28,28,0.5)]' : 'bg-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.3)]'
        }`} />
        <div className={`absolute -bottom-[10%] -right-[10%] w-[45%] h-[40%] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse transition-all duration-1000 ${
          isHardcore ? 'bg-rose-600/40 shadow-[0_0_50px_rgba(225,29,72,0.4)]' : 'bg-fuchsia-600/35 shadow-[0_0_50px_rgba(217,70,239,0.3)]'
        }`} />
        <div className={`absolute top-[40%] left-[50%] w-[35%] h-[35%] rounded-full mix-blend-screen filter blur-[100px] opacity-20 transition-all duration-1000 ${
          isHardcore ? 'bg-orange-800/30' : 'bg-indigo-600/20'
        }`} />
      </div>
      
      {/* Game Canvas Container */}
      <div 
        className={`relative shadow-2xl overflow-hidden bg-slate-950 rounded-[28px] border transition-all duration-700 z-10 ${
          isHardcore 
            ? 'border-red-500/40 ring-4 ring-red-500/10 shadow-[0_0_80px_rgba(239,68,68,0.35)]' 
            : 'border-cyan-500/40 ring-4 ring-cyan-500/10 shadow-[0_0_80px_rgba(6,182,212,0.25)]'
        }`} 
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
        }}
      >
        <canvas 
          ref={canvasRef} 
          width={GAME_WIDTH} 
          height={GAME_HEIGHT}
          className="w-full h-full cursor-pointer touch-none"
        />
        {/* Pause and HUD Controls Toolbar */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-30 flex items-center gap-1.5 sm:gap-2">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 setGameState('PAUSED');
               }}
               className="bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1 transition-all text-[11px] font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.45)] whitespace-nowrap"
             >
               <Pause className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
               <span className="hidden xs:inline">Pausar</span>
             </button>

             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 setHudMode(prev => prev === 'FULL' ? 'MINIMAL' : prev === 'MINIMAL' ? 'HIDDEN' : 'FULL');
               }}
               className="bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.45)] whitespace-nowrap"
               title="Cambiar vista de interfaz (Modo Teléfono)"
             >
               {hudMode === 'FULL' ? (
                 <>
                   <Eye className="w-3.5 h-3.5 text-emerald-400" /> 
                   <span className="hidden xs:inline text-emerald-305">HUD: Max</span>
                 </>
               ) : hudMode === 'MINIMAL' ? (
                 <>
                   <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                   <span className="hidden xs:inline text-amber-305">HUD: Min</span>
                 </>
               ) : (
                 <>
                   <EyeOff className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                   <span className="hidden xs:inline text-red-200">HUD: Off</span>
                 </>
               )}
             </button>
          </div>
        )}
        {/* HUD Overlay with dynamic visibility modes */}
        {hudMode !== 'HIDDEN' && (
          <>
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.3)] z-10" />
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none z-20">
              <div className="flex gap-2 sm:gap-4 scale-75 sm:scale-100 origin-top-left">
                 <motion.div 
                   animate={score % 100 === 0 && score > 0 ? { scale: [1, 1.1, 1] } : {}}
                   className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 border border-white/10 shadow-2xl"
                 >
                    {gameMode === 'AI_DODGE' ? (
                      <>
                        <span className="text-red-500 font-extrabold text-xs uppercase tracking-widest">💥 Duelo IA</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-500 shadow-glow" />
                        <span className="text-white font-black text-xl tabular-nums tracking-tighter">{score.toLocaleString().padStart(6, '0')}</span>
                      </>
                    )}
                 </motion.div>

                 {hudMode === 'FULL' && (
                   <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 border border-white/10 shadow-2xl">
                      {gameMode === 'AI_DODGE' ? (
                        <>
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-black text-sm tabular-nums tracking-tighter">+{credits}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Hi</span>
                          <span className="text-white/60 font-black text-lg tabular-nums tracking-tighter">{highScore.toLocaleString()}</span>
                        </>
                      )}
                   </div>
                 )}
              </div>
              
              <div className="flex flex-col items-end gap-1 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-1.5 scale-75 sm:scale-100 origin-top-right bg-black/40 px-2 py-1 rounded-lg">
                  {gameMode === 'AI_DODGE' ? (
                    <>
                      <span className="text-[9px] text-red-500 font-black uppercase tracking-widest mr-2">Vaca IA:</span>
                      {Array.from({ length: AI_DIFFICULTIES[aiDifficulty]?.lives || 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={i < aiLives ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.35 }}
                          className="ml-0.5"
                        >
                          <Heart 
                            className={`w-3.5 h-3.5 filter drop-shadow-lg ${i < aiLives ? 'text-red-500 fill-red-500 animate-pulse' : 'text-gray-800 fill-gray-950 opacity-30'}`} 
                          />
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={i < playerRef.current.lives ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.3 }}
                        >
                          <Heart 
                            className={`w-5 h-5 filter drop-shadow-lg ${i < playerRef.current.lives ? 'text-red-500 fill-red-500' : 'text-gray-800 fill-gray-900 border-gray-700'}`} 
                          />
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>
                {gameState === 'PLAYING' && hudMode === 'FULL' && (
                  <motion.div 
                    className="bg-black/60 backdrop-blur-md rounded-lg px-2 py-1.5 border border-white/10 flex flex-col items-center"
                  >
                    {gameMode === 'AI_DODGE' ? (
                      <div className="flex flex-col items-center min-w-[125px] pr-1 pointer-events-auto">
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">CD de Pájaros</span>
                        <div className="w-full bg-gray-800/80 h-1.5 rounded-full mt-1 overflow-hidden border border-white/5 relative">
                          <div 
                            className={`h-full transition-all duration-75 ${birdCooldown > 0 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}
                            style={{ width: `${birdCooldown > 0 ? birdCooldown : 100}%` }}
                          />
                        </div>
                        <span className="text-[7.5px] font-black uppercase tracking-wider mt-1 text-gray-300">
                          {birdCooldown > 0 ? 'Recargando...' : '¡LISTO PARA DISPARAR!'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Airspeed</span>
                        <span className="text-white font-black text-sm tabular-nums tracking-tighter">
                          {Math.min(900, Math.floor(OBSTACLE_SPEED * (1 + (levelRef.current - 1) * 0.3 + Math.min(1, scoreRef.current / 90000) * 1.5) * (playerRef.current.hasPower ? 2.5 : 1) * 20))} KM/H
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Cow Power Active Indicator (scales with game) */}
        <AnimatePresence>
          {playerRef.current.hasPower && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0 }}
               className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 scale-75 sm:scale-100 bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-xl"
            >
               <div className="flex gap-2 mb-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-4 h-4 rounded-full border-2 border-white/40 transition-all ${i < playerRef.current.coolBirdsKilled ? 'bg-yellow-400 scale-110' : 'bg-black/40'}`} 
                    />
                  ))}
               </div>
               <div className="w-48 h-2 bg-black/40 rounded-full overflow-hidden border border-white/20">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                  />
               </div>
               <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter font-sans">Cow Power Active</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Player 2 Summoner Control Dock (Multiplayer Mode) */}
      {gameState === 'PLAYING' && gameMode === 'MULTIPLAYER' && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full xl:w-[380px] bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-[28px] p-5 sm:p-6 flex flex-col justify-between shadow-2xl relative select-none shrink-0"
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦅</span>
                <div>
                  <h3 className="text-white font-black text-xs uppercase tracking-wider leading-none">PANEL DEL CAOS</h3>
                  <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-1 block font-mono">Jugador 2</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-none font-mono">Meta del Toro</span>
                <span className="text-amber-400 font-black text-sm tabular-nums">{score} <span className="text-[9px] text-gray-500 font-extrabold">/2500</span></span>
              </div>
            </div>

            {/* Glowing Liquid Energy Tank */}
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 mb-5 text-center shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-center mb-1.5 z-10 relative">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest font-mono">Enérgia de Caos</span>
                <span className="text-indigo-400 font-black text-lg sm:text-xl tabular-nums animate-pulse">{chaosPoints} <span className="text-[10px] text-gray-500 font-extrabold">/ 100</span></span>
              </div>
              <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden border border-white/10 relative p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 rounded-full"
                  animate={{ width: `${chaosPoints}%` }}
                  transition={{ type: 'spring', stiffness: 50 }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[pulse_2s_linear_infinite] pointer-events-none opacity-30" />
              </div>
            </div>

            {/* Summon Grid */}
            <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest block mb-3 font-mono">CONVOCAR ESBIRROS</span>
            <div className="grid grid-cols-1 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
              {[
                { id: 'yellow' as const, name: 'Pájaro Amarillo', cost: 12, key: '1', emoji: '🐦', desc: 'Esbirro volador básico equilibrado', speed: 'Normal' },
                { id: 'cool' as const, name: 'Pájaro Cool', cost: 20, key: '2', emoji: '👓', desc: 'Vuela a velocidad supersónica', speed: 'Rápido' },
                { id: 'ninja' as const, name: 'Pájaro Ninja', cost: 30, key: '3', emoji: '🥷', desc: 'Trayectoria ondulante evasiva', speed: 'Ondulante' },
                { id: 'kamikaze' as const, name: 'Pájaro Kamikaze', cost: 35, key: '4', emoji: '💥', desc: 'Ataque frontal a toda velocidad', speed: 'Letal' },
                { id: 'grenadier' as const, name: 'Pájaro Granadero', cost: 50, key: '5', emoji: '💣', desc: 'Suelta bombas destructivas', speed: 'Lanzador' }
              ].map((item) => {
                const canAfford = chaosPoints >= item.cost;
                const isSelected = selectedMultiplayerBird === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMultiplayerBird(item.id)}
                    className={`text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-650/40 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                        : canAfford
                          ? 'bg-black/30 border-white/5 hover:bg-black/50 hover:border-white/10'
                          : 'bg-black/20 border-white/5 opacity-55'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl sm:text-2xl">{item.emoji}</span>
                      <div>
                        <span className="text-[11px] font-black text-white block">{item.name}</span>
                        <p className="text-[9px] text-gray-400 leading-none">{item.desc}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-black tabular-nums ${canAfford ? 'text-cyan-400' : 'text-rose-500'}`}>
                          {item.cost}⚡
                        </span>
                        <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-widest font-mono">TECLA {item.key}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            {/* Boss Summon Slot */}
            <div className="mt-5 pt-4 border-t border-white/5">
              {bossRef.current && bossRef.current.state === 'active' ? (
                <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-3 text-center mb-3">
                  <span className="text-[9px] text-red-400 font-black uppercase tracking-widest block mb-0.5 animate-pulse font-mono">⚡ ¡JEFE EN BATALLA! ⚡</span>
                  <p className="text-[10px] text-gray-300">Toca el Lienzo para disparar proyectiles veloces dirigidos.</p>
                  <span className="text-[9px] text-cyan-400 font-black tabular-nums block mt-1">Coste: 12⚡ por tiro</span>
                </div>
              ) : (
                <button
                  onClick={summonMultiplayerBoss}
                  disabled={chaosPoints < 100}
                  className={`w-full py-3.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    chaosPoints >= 100
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-purple-900/30'
                      : 'bg-black/40 border border-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>💀 CONVOCAR JEFE</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] text-cyan-300 tabular-nums">100⚡</span>
                </button>
              )}
            </div>

            <div className="mt-4 text-center rounded-xl bg-indigo-950/20 border border-indigo-500/10 p-2.5">
              <p className="text-[9px] text-indigo-300 leading-normal font-medium">
                💡 Haz clic o pulsa en la <strong className="text-white">mitad derecha del juego</strong> para desplegar al esbirro seleccionado en esa fila.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full-screen Responsive Overlays */}
      <AnimatePresence>
          {gameState === 'SPLASH' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 overflow-hidden flex flex-col items-center justify-center p-8 z-50 pointer-events-none"
            >
              {/* Dynamic Rotating Starburst Effect */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[220%] h-[220%] flex items-center justify-center overflow-hidden opacity-30"
              >
                 {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full h-10 bg-yellow-300"
                      style={{ transform: `rotate(${i * 15}deg)` }}
                    />
                 ))}
              </motion.div>
              
              {/* Radial gradient vignette overlay */}
              <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_10%,rgba(0,0,0,0.65))] z-10" />

              {/* Soaring Rocket Bull Animation */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [-1, 2, -1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="z-20 text-[5rem] sm:text-[7rem] mb-2 transform select-none"
              >
                🐄🚀
              </motion.div>

              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                className="relative flex flex-col items-center max-w-md z-20"
              >
                {/* 3D-like Retro Display Title */}
                <h1 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#990000] transform -skew-x-12 select-none uppercase">
                  ROCKET
                </h1>
                <h1 className="text-7xl sm:text-9xl font-black text-yellow-300 italic tracking-tighter -mt-3 sm:-mt-6 drop-shadow-[0_5px_0_#b30000] transform -skew-x-12 select-none uppercase">
                  BULL
                </h1>
                
                {/* Neon-like version sticker */}
                <div className="absolute -top-6 -right-6 bg-red-600 text-white px-3 py-1 text-[10px] font-black rounded-full rotate-12 shadow-lg border-2 border-white animate-pulse">
                  V69 ARCADE
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 sm:mt-8 px-4 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-[9px] sm:text-[11px] text-white/90 uppercase font-bold tracking-[0.25em] z-20 text-center shadow-md shadow-orange-950/20"
              >
                🎮 Ultimate Rocket Cow Simulator 🎮
              </motion.div>

              <div className="absolute bottom-10 left-0 w-full flex flex-col items-center justify-center z-20">
                <div className="text-white/60 font-black uppercase tracking-[0.3em] text-[9px] sm:text-xs animate-pulse">
                  Iniciando Sistemas de Propulsión...
                </div>
                <div className="w-24 bg-white/10 h-1 rounded-full mt-3 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-red-500 to-yellow-400"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'LOBBY' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex flex-col items-center justify-start p-4 sm:p-6 z-40 overflow-y-auto transition-colors duration-1000 ${
                isHardcore 
                  ? 'bg-[#150002]' 
                  : 'bg-slate-950'
              }`}
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className={`absolute inset-0 transition-all duration-1000 bg-gradient-to-br ${
                   isHardcore 
                     ? 'from-red-950/40 via-neutral-950 to-red-900/10' 
                     : 'from-indigo-950/30 via-[#0a0a16] to-[#120524]'
                 }`} />
                 <div className="w-full h-full opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />
                 
                 {/* Decorative moving shapes */}
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                   className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-1000 ${
                     isHardcore ? 'bg-red-600/15' : 'bg-cyan-500/15'
                   }`} 
                 />
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                   className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-1000 ${
                     isHardcore ? 'bg-rose-500/15' : 'bg-fuchsia-500/15'
                   }`} 
                 />
              </div>

              {/* Lobby Header */}
              <div className="relative flex w-full justify-between items-center mb-6 sm:mb-10 z-10">
                 <div className="flex items-center gap-3">
                   {user ? (
                     <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3 sm:pr-4 py-1 shadow-xl"
                     >
                        <img src={user.photoURL || ''} alt="User" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white/20" />
                        <span className="text-white font-black text-xs sm:text-sm tracking-tight truncate max-w-[80px] sm:max-w-none">{user.displayName}</span>
                     </motion.div>
                   ) : (
                     <button 
                        onClick={handleSignIn}
                        disabled={isSigningIn}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5 transition-all group backdrop-blur-md disabled:opacity-50"
                     >
                        {isSigningIn ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 animate-spin" />
                        ) : (
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white" />
                        )}
                        <span className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest leading-none">
                          {isSigningIn ? 'Connecting...' : 'Connect'}
                        </span>
                     </button>
                   )}
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setShowBestiary(!showBestiary);
                        setShowShop(false);
                        setShowLeaderboard(false);
                        setShowDailyRewards(false);
                      }}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full transition-all border shadow-lg ${showBestiary ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md'}`}
                    >
                      <ShieldAlert className="w-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">{showBestiary ? 'Close' : 'Enemies'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowShop(!showShop);
                        setShowLeaderboard(false);
                        setShowBestiary(false);
                        setShowDailyRewards(false);
                      }}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full transition-all border shadow-lg ${showShop ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md'}`}
                    >
                      <ShoppingBag className="w-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">{showShop ? 'Close' : 'Shop'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowLeaderboard(!showLeaderboard);
                        setShowShop(false);
                        setShowBestiary(false);
                        setShowDailyRewards(false);
                        setShowSettings(false);
                      }}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full transition-all border shadow-lg ${showLeaderboard ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md'}`}
                    >
                      <Globe className="w-3 mx-auto sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">{showLeaderboard ? 'Return' : 'Rankings'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowSettings(!showSettings);
                        setShowLeaderboard(false);
                        setShowShop(false);
                        setShowBestiary(false);
                        setShowDailyRewards(false);
                      }}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full transition-all border shadow-lg ${showSettings ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md'}`}
                    >
                      <Settings className="w-3 mx-auto sm:w-4 sm:h-4 lg:animate-[spin_8s_linear_infinite]" />
                      <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">{showSettings ? 'Cerrar' : 'Ajustes'}</span>
                    </button>
                 </div>
              </div>

              <AnimatePresence mode="wait">
                {!showLeaderboard && !showShop && !showBestiary && !showDailyRewards && !showSettings ? (
                  <motion.div 
                    key="lobby-main"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative flex flex-col items-center w-full z-10"
                  >
                    <motion.div 
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                      className="flex flex-col items-center mb-4 sm:mb-6"
                    >
                      <div className="h-1 w-8 sm:w-12 bg-red-600 rounded-full mb-2 sm:mb-4 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                      <h2 className="text-2xl sm:text-5xl font-black text-white italic tracking-tighter uppercase text-center">
                        BATTLE <span className="text-red-500">STATION</span>
                      </h2>
                    </motion.div>

                    {/* Compact Mode Toggles Segment Control */}
                    <div className="flex flex-wrap items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl md:rounded-full p-1.5 border border-white/10 mb-6 scale-95 sm:scale-100 shadow-xl gap-1">
                      <button
                        onClick={() => setGameMode('LEVELS')}
                        className={`px-4 py-1.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          gameMode === 'LEVELS'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500/20'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Campio Niveles
                      </button>
                      <button
                        onClick={() => setGameMode('INFINITE')}
                        className={`px-4 py-1.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          gameMode === 'INFINITE'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500/20'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Modo Infinito
                      </button>
                      <button
                        onClick={() => setGameMode('AI_DODGE')}
                        className={`px-4 py-1.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          gameMode === 'AI_DODGE'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500/20'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Duelo IA
                      </button>
                      <button
                        onClick={() => setGameMode('MULTIPLAYER')}
                        className={`px-4 py-1.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          gameMode === 'MULTIPLAYER'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500/20'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Multijugador ⚔️
                      </button>
                    </div>

                    {/* Camino de XP / XP Progression Highway */}
                    <div className="w-full max-w-xl bg-black/50 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/10 mb-6 text-left relative overflow-hidden shadow-2xl">
                      <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">✨</span>
                          <div>
                            <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider italic">Camino de Recompensas XP</h3>
                            <p className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest leading-none">Desbloquea bonos masivos al subir de rango</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-black px-3 py-1 rounded-full text-[10px] sm:text-xs font-black italic tracking-tight shadow-md">
                          RANGO {xpLevel}
                        </div>
                      </div>

                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/10 relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.floor((xp / (1000 + xpLevel * 500)) * 100))}%` }}
                          className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 h-full rounded-full"
                        />
                      </div>

                      <div className="flex justify-between items-center mt-3 font-mono">
                        <span className="text-gray-400 text-[10px] sm:text-[11px]">{xp} / {1000 + xpLevel * 500} XP para Rango {xpLevel + 1}</span>
                        <span className="text-yellow-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest animate-pulse">
                          🎁 Rango {xpLevel+1}: +{((xpLevel + 1) * 400).toLocaleString()} Créditos
                        </span>
                      </div>
                    </div>

                    {/* Flight Telemetry and Combat Attributes Graphics Dashboard */}
                    <FlightStatsDashboard 
                      scoreHistory={scoreHistory} 
                      activeSkin={activeSkin} 
                      totalMatches={totalMatches} 
                    />

                    {/* HARDCORE WORLD PANEL (Only visible once unlocked as a major secret reward!) */}
                    {hardcoreUnlocked && (
                      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-r from-red-950/25 to-black bg-black/40 backdrop-blur-md rounded-2xl border border-red-500/15 p-4 flex flex-col items-center shadow-xl mb-6 text-center z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm">🔥</span>
                          <span className="text-[10px] sm:text-xs text-red-500 font-extrabold uppercase tracking-widest animate-pulse">
                            MUNDO HARDCORE: REVELADO ☄️
                          </span>
                          <span className="bg-red-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                            DESBLOQUEADO 🔓
                          </span>
                        </div>
                        
                        <p className="text-[10px] sm:text-[11px] text-gray-400 mb-3 max-w-xs leading-normal">
                          Velocidad base x1.45, spawn de obstáculos masivo, jefes con +50% vida, y el mapa cambia a un entorno de Caos Devastador.
                        </p>
                        
                        <button
                          onClick={() => {
                            const next = !isHardcore;
                            setIsHardcore(next);
                            localStorage.setItem('rocketbull_hardcore_active', next ? 'true' : 'false');
                          }}
                          className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-2
                            ${isHardcore 
                              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500/20' 
                              : 'bg-gray-800 text-gray-400 hover:text-white border border-white/5 hover:bg-gray-700'}`}
                        >
                          <span>{isHardcore ? '🟢 MODO HARDCORE: ACTIVO ⚡' : '🔴 MODO HARDCORE: INACTIVO'}</span>
                        </button>
                      </div>
                    )}

                    {/* Mode dependent view renderers */}
                    {gameMode === 'LEVELS' && (
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-4 w-full max-w-4xl mb-8 sm:mb-12 overflow-y-auto max-h-[300px] sm:max-h-[400px] p-2 custom-scrollbar">
                        {Array.from({ length: 80 }).map((_, i) => {
                          const l = i + 1;
                          return (
                            <motion.button
                              key={l}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (i % 20) * 0.01 }}
                              whileHover={l <= unlockedLevels ? { scale: 1.1, y: -4 } : {}}
                              whileTap={l <= unlockedLevels ? { scale: 0.95 } : {}}
                              disabled={l > unlockedLevels}
                              onClick={() => selectLevel(l)}
                              className={`relative aspect-square rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-1 sm:p-2 shadow-lg overflow-hidden group
                                ${l <= unlockedLevels 
                                  ? 'bg-gradient-to-br from-gray-800 to-gray-950 border-gray-800 hover:border-red-600 cursor-pointer' 
                                  : 'bg-black/40 border-gray-900 opacity-40 cursor-not-allowed'}`}
                            >
                              <div className={`text-lg sm:text-2xl font-black italic tracking-tighter ${l <= unlockedLevels ? 'text-white' : 'text-gray-700'}`}>
                                  {l}
                              </div>
                              
                              {l > unlockedLevels ? (
                                  <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-gray-700 mt-0.5 sm:mt-1" />
                              ) : (
                                  <div className="mt-0.5 sm:mt-1 w-3 h-3 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg">
                                     <Play className="w-2 h-2 sm:w-3 sm:h-3 fill-current ml-0.5" />
                                  </div>
                              )}
    
                              {l === level && l <= unlockedLevels && (
                                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border border-gray-950 shadow-[0_0_5px_#10b981]" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {gameMode === 'INFINITE' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center py-6 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 w-full max-w-sm mb-8 shadow-2xl"
                      >
                        <Trophy className="w-10 h-10 text-yellow-500 mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] animate-bounce" />
                        <span className="text-yellow-400 font-extrabold text-[10px] uppercase tracking-widest mb-1">RÉCORD MODO INFINITO</span>
                        <div className="text-white text-3xl font-black italic tracking-tighter mb-4 tabular-nums">
                          {highScore.toLocaleString()} <span className="text-gray-500 text-xs uppercase font-extrabold">pts</span>
                        </div>
                        <p className="text-gray-400 text-[11px] text-center mb-5 leading-normal max-w-[280px]">
                          Vuela sin límites. El juego se vuelve más y más rápido conforme avanza tu puntuación. ¿De qué nivel eres capaz?
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetGame}
                          className="w-full bg-gradient-to-r from-red-600 to-orange-500 font-extrabold text-xs uppercase tracking-widest text-white py-3 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.4)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.6)] cursor-pointer"
                        >
                          Lanzar Infinito
                        </motion.button>
                      </motion.div>
                    )}

                    {gameMode === 'AI_DODGE' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center py-5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 w-full max-w-md mb-8 shadow-2xl"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xl mb-2 animate-pulse select-none">🎯</div>
                        <span className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">DUELO REVERSO IA</span>
                        <p className="text-gray-300 text-[11px] text-center mb-4 leading-relaxed max-w-[340px]">
                          ¡Inversión de roles! Toca el cielo para **lanzar pájaros**. La vaca de la IA esquiva tus tiros con sus propulsores. ¡Derrótala para ganar monedas!
                        </p>

                        {/* Difficulty Segmented Selector */}
                        <div className="w-full bg-black/85 rounded-xl p-1.5 border border-white/5 mb-4 flex gap-1 flex-wrap sm:flex-nowrap">
                          {(['FACIL', 'MEDIO', 'DIFICIL', 'SUPREMO'] as const).map((diff) => {
                            const config = AI_DIFFICULTIES[diff];
                            const isSelected = aiDifficulty === diff;
                            return (
                              <button
                                key={diff}
                                onClick={() => setAiDifficulty(diff)}
                                className={`flex-1 py-1 px-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer text-center leading-none ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-red-650 to-amber-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                              >
                                {config.label}
                                <span className={`block text-[7px] mt-0.5 font-bold ${isSelected ? 'text-yellow-250' : 'text-gray-650'}`}>
                                  +{config.reward}🪙
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected configuration detail card */}
                        <div className="w-full p-2.5 rounded-lg bg-black/40 border border-white/5 mb-4 text-center">
                          <span className="text-[9px] text-yellow-500 font-extrabold uppercase tracking-widest">
                            🛡️ Escudo IA: {AI_DIFFICULTIES[aiDifficulty].lives} Vidas
                          </span>
                          <p className="text-[10px] text-gray-450 mt-0.5 leading-tight">
                            {AI_DIFFICULTIES[aiDifficulty].desc}
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetGame}
                          className="w-full bg-gradient-to-r from-red-600 to-orange-500 font-extrabold text-xs uppercase tracking-widest text-white py-3 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.4)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.6)] cursor-pointer"
                        >
                          Lanzar Reto ({AI_DIFFICULTIES[aiDifficulty].label})
                        </motion.button>
                      </motion.div>
                    )}

                    {gameMode === 'MULTIPLAYER' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center py-5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 w-full max-w-md mb-8 shadow-2xl"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl mb-2 animate-bounce select-none">⚔️</div>
                        <span className="text-indigo-400 font-extrabold text-[10px] uppercase tracking-widest mb-1">DUELO MULTIPLAYER LOCAL</span>
                        <p className="text-gray-350 text-[11px] text-center mb-4 leading-normal max-w-[340px]">
                          Un electrizante enfrentamiento donde un jugador pilota los propulsores del Toro Cohete y el otro convoca pájaros y jefes de manera activa en tiempo real.
                        </p>

                        <div className="w-full text-left bg-black/40 border border-white/5 rounded-xl p-3.5 mb-5 space-y-2.5 text-[11px] leading-snug">
                          <div>
                            <span className="text-amber-400 font-black">🐮 JUGADOR 1 (Toro Cohete)</span>
                            <p className="text-gray-400">Esquiva obstáculos y sobrevive hasta los <span className="text-white font-extrabold">1,000 pts</span>. Controla usando la <span className="text-white font-extrabold">mitad izquierda</span> de la pantalla, la tecla <span className="text-white font-extrabold">W</span> o <span className="text-white font-extrabold">Espacio</span>.</p>
                          </div>
                          <div>
                            <span className="text-red-400 font-black">🦅 JUGADOR 2 (Control de Caos)</span>
                            <p className="text-gray-400">Genera enemigos haciendo clic en la <span className="text-white font-extrabold">mitad derecha</span> a la altura deseada. Elige aves con <span className="text-white font-extrabold">1-5</span> y convoca un <span className="text-purple-400 font-extrabold">JEFE (B/6)</span> con 100 de Energía Caos.</p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetGame}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 font-extrabold text-xs uppercase tracking-widest text-white py-3 rounded-full shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.6)] cursor-pointer"
                        >
                          Iniciar Duelo
                        </motion.button>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full max-w-sm sm:max-w-none">
                       <motion.div 
                        whileHover={{ y: -5 }}
                        className="w-full sm:w-auto bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center min-w-[140px] sm:min-w-[160px] shadow-2xl"
                       >
                          <span className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Pilot Status</span>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                             <span className="text-white font-black text-xs sm:text-sm uppercase italic">Combat Ready</span>
                          </div>
                       </motion.div>
                       <motion.div 
                        whileHover={{ y: -5 }}
                        className="w-full sm:w-auto bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center min-w-[140px] sm:min-w-[160px] shadow-2xl"
                       >
                          <span className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Expansion</span>
                          <span className="text-red-500 font-black text-lg sm:text-2xl italic tracking-tighter">{unlockedLevels}<span className="text-gray-700">/80</span></span>
                       </motion.div>
                    </div>

                    {/* UI HUD Mode Selector Card - Perfect for Phone / Mobile optimization */}
                    <div className="w-full max-w-sm sm:max-w-md bg-black/45 backdrop-blur-md border border-white/5 rounded-2xl sm:rounded-3xl p-4 flex flex-col items-center shadow-2xl mt-5">
                      <span className="text-[8px] sm:text-[9.5px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                        📱 DIAL DE AJUSTES EN PANTALLA (TELEFONO / MÓVIL)
                      </span>
                      <div className="w-full bg-black/70 rounded-full p-1 border border-white/10 flex gap-1 shadow-inner">
                        <button
                          onClick={() => setHudMode('FULL')}
                          className={`flex-1 py-1.5 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            hudMode === 'FULL'
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_10px_rgba(220,38,38,0.45)] border border-red-500/20'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Completo
                        </button>
                        <button
                          onClick={() => setHudMode('MINIMAL')}
                          className={`flex-1 py-1.5 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            hudMode === 'MINIMAL'
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.45)] border border-amber-500/20'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Minimalista
                        </button>
                        <button
                          onClick={() => setHudMode('HIDDEN')}
                          className={`flex-1 py-1.5 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            hudMode === 'HIDDEN'
                              ? 'bg-gradient-to-r from-gray-650 to-gray-750 text-white shadow-[0_0_10px_rgba(255,255,255,0.15)] border border-gray-650/20'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Cine (Oculto)
                        </button>
                      </div>
                      <p className="text-[9.5px] text-center text-gray-400/90 leading-tight mt-2.5 max-w-[325px]">
                        {hudMode === 'FULL' && '🎮 Muestra todos los puntos, hi-scores, velocidad y monedas en pantalla.'}
                        {hudMode === 'MINIMAL' && '⚡ Oculta records y velocità. ¡Ideal para despejar visibilidad en teléfono!'}
                        {hudMode === 'HIDDEN' && '✨ Oculta absolutamente todos los marcadores para máxima visibilidad.'}
                      </p>
                    </div>
                  </motion.div>
                ) : showDailyRewards ? (
                     <motion.div 
                         key="daily-rewards"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 20 }}
                         className="w-full max-w-2xl flex flex-col items-center p-2 text-white"
                     >
                         {/* Header */}
                         <div className="flex flex-col items-center gap-2 mb-6 text-center select-none">
                           <div className="flex items-center gap-3">
                             <span className="text-3xl sm:text-4xl animate-bounce">🎁</span>
                             <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">
                               RECOMPENSAS <span className="text-indigo-400">DIARIAS</span>
                             </h2>
                           </div>
                           <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest leading-relaxed">
                             ★ Reclama premios diarios y completa misiones militares ★
                           </p>
                         </div>

                         {/* Info: Credits Display */}
                         <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3 mb-6 shadow-xl">
                             <Coins className="w-5 h-5 text-yellow-400" />
                             <span className="text-yellow-400 font-black text-xl italic tracking-tighter">
                               {credits.toLocaleString()}{" "}
                               <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1">
                                 Créditos Poseídos
                               </span>
                             </span>
                         </div>

                         {/* 7 Days Grid */}
                         <div className="w-full mb-8">
                           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                             {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                               // Day configurations
                               const configs = [
                                 { reward: 150, emoji: '🪙', label: 'Day 1' },
                                 { reward: 300, emoji: '🪙', label: 'Day 2' },
                                 { reward: 500, emoji: '⚡', label: 'Day 3' },
                                 { reward: 750, emoji: '🔥', label: 'Day 4' },
                                 { reward: 1000, emoji: '⭐', label: 'Day 5' },
                                 { reward: 1500, emoji: '💎', label: 'Day 6' },
                                 { reward: 'ALIEN 👽', emoji: '👑', label: 'Day 7' }
                               ];
                               const conf = configs[dayNum - 1];
                               const isClaimed = dayNum <= claimStreak;
                               const isCurrent = dayNum === claimStreak + 1 && isDailyClaimable;

                               return (
                                 <motion.div
                                   key={dayNum}
                                   whileHover={isCurrent ? { scale: 1.05 } : {}}
                                   className={`relative p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all h-[110px] ${
                                     isClaimed
                                       ? 'bg-emerald-500/10 border-emerald-500/45 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                       : isCurrent
                                       ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] animate-pulse border-2'
                                       : 'bg-black/40 border-white/5 text-gray-550'
                                   }`}
                                 >
                                   <span className="text-[10px] font-bold uppercase tracking-wider">{conf.label}</span>
                                   <span className="text-2xl mt-1 select-none">{isClaimed ? '✅' : conf.emoji}</span>
                                   <span className="text-[9px] font-black tracking-tight leading-none mt-1">
                                     {conf.reward === 'ALIEN 👽' ? 'Vaca Alien' : `+${conf.reward}🪙`}
                                   </span>
                                   
                                   {isCurrent && (
                                     <span className="absolute -inset-0.5 rounded-2xl border-2 border-indigo-400/40 animate-ping pointer-events-none" />
                                   )}
                                 </motion.div>
                               );
                             })}
                           </div>

                           {/* Claim Big Glowing Button */}
                           <div className="w-full mt-4 flex justify-center">
                             <motion.button
                               whileHover={isDailyClaimable ? { scale: 1.05, y: -2 } : {}}
                               whileTap={isDailyClaimable ? { scale: 0.95 } : {}}
                               disabled={!isDailyClaimable}
                               onClick={claimDailyReward}
                               className={`w-full max-w-sm py-3 px-6 rounded-full font-black uppercase text-xs tracking-widest text-white shadow-xl transition-all cursor-pointer ${
                                 isDailyClaimable
                                   ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400/20 text-white'
                                   : 'bg-white/5 border border-white/5 text-gray-500 select-none'
                               }`}
                             >
                               {isDailyClaimable ? 'Reclamar Premio de Hoy! 🎉' : `Premio Bloqueado (Vuelve Mañana!)`}
                             </motion.button>
                           </div>
                         </div>

                         {/* Achievements / Daily Missions Section */}
                         <div className="w-full max-w-xl flex flex-col items-center">
                           <div className="flex items-center gap-2 mb-4 w-full justify-start select-none border-b border-white/5 pb-2">
                             <span className="text-xl">🏆</span>
                             <h3 className="text-md sm:text-lg font-black tracking-tighter uppercase text-white">MISIONES MILITARES</h3>
                           </div>

                           <div className="w-full space-y-3.5">
                             {[
                               {
                                 id: 'm1',
                                 title: 'Gran Piloto de Bull',
                                 desc: 'Consigue 3,000 puntos en cualquier modo de vuelo.',
                                 reward: 500,
                                 progress: highScore,
                                 target: 3000,
                                 icon: '🎖️'
                               },
                               {
                                 id: 'm2',
                                 title: 'Cazador de Plumas',
                                 desc: 'Derriba 10 enemigos volando con propulsores activos.',
                                 reward: 800,
                                 progress: birdsDefeatedCount,
                                 target: 10,
                                 icon: '🎯'
                               },
                               {
                                 id: 'm3',
                                 title: 'Veterano Espacial',
                                 desc: 'Desbloquea o alcanza la Fase 5 en el modo niveles.',
                                 reward: 1050,
                                 progress: unlockedLevels,
                                 target: 5,
                                 icon: '🚀'
                               }
                             ].map((m) => {
                               const isEarned = m.progress >= m.target;
                               const isClaimed = claimedMissions.includes(m.id);
                               const progressPct = Math.min(100, Math.floor((m.progress / m.target) * 100));

                               return (
                                 <div
                                   key={m.id}
                                   className={`w-full p-4 rounded-3xl border flex flex-col justify-between overflow-hidden shadow-xl ${
                                     isClaimed
                                       ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/40 select-none'
                                       : isEarned
                                       ? 'bg-yellow-400/10 border-yellow-400/30'
                                       : 'bg-white/5 border-white/10'
                                   }`}
                                 >
                                   <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                       <span className="text-2xl">{m.icon}</span>
                                       <div>
                                         <h4 className={`font-black text-sm uppercase italic tracking-tight leading-none ${isClaimed ? 'text-gray-500 line-through' : 'text-white'}`}>{m.title}</h4>
                                         <p className="text-[10px] text-gray-400 mt-1">{m.desc}</p>
                                       </div>
                                     </div>
                                     <div className="text-right">
                                       <span className="text-yellow-400 font-extrabold text-xs">+{m.reward}🪙</span>
                                     </div>
                                   </div>

                                   {/* Progress bar and button row */}
                                   <div className="mt-4 flex items-center justify-between gap-4">
                                     <div className="flex-1">
                                       <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                         <span>Progreso</span>
                                         <span>{m.progress.toLocaleString()} / {m.target.toLocaleString()} ({progressPct}%)</span>
                                       </div>
                                       <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/5">
                                         <div
                                           className={`h-full rounded-full transition-all duration-500 ${
                                             isClaimed
                                               ? 'bg-emerald-500/30'
                                               : isEarned
                                               ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-[0_0_8px_#fbbf24]'
                                               : 'bg-indigo-500'
                                           }`}
                                           style={{ width: `${progressPct}%` }}
                                         />
                                       </div>
                                     </div>

                                     <div>
                                       {isClaimed ? (
                                         <span className="text-xs font-black text-emerald-500 uppercase tracking-widest pl-2">✅ RECLAMADO</span>
                                       ) : isEarned ? (
                                         <motion.button
                                           whileHover={{ scale: 1.05 }}
                                           whileTap={{ scale: 0.95 }}
                                           onClick={() => claimMission(m.id, m.reward)}
                                           className="bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase text-[10px] tracking-wider px-4 py-1.5 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.4)] cursor-pointer"
                                         >
                                           RECLAMAR CRÉDITOS! 💸
                                         </motion.button>
                                       ) : (
                                         <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider block">EN CURSO...</span>
                                       )}
                                     </div>
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                     </motion.div>
                ) : showSettings ? (
                    <motion.div 
                        key="settings-control"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full max-w-xl flex flex-col items-center select-none"
                    >
                        <div className="flex items-center gap-4 mb-6 sm:mb-8 text-center pt-2">
                            <Settings className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-[spin_5s_linear_infinite]" />
                            <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">
                                PANEL DE <span className="text-cyan-400">CONFIGURACIÓN</span>
                            </h2>
                        </div>

                        {/* Interactive toggle panel */}
                        <div className="bg-black/55 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 w-full mb-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col pr-4 text-left">
                                    <span className="text-white font-black text-sm sm:text-base uppercase tracking-tight">🎶 Música de Fondo</span>
                                    <span className="text-gray-400 text-[10px] sm:text-xs text-left">Pista retro 8-bit autogenerada por sintetizador WebAudio</span>
                                </div>
                                <button 
                                    onClick={toggleMusic}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${musicEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${musicEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                <div className="flex flex-col pr-4 text-left">
                                    <span className="text-white font-black text-sm sm:text-base uppercase tracking-tight">🔊 Efectos de Sonido</span>
                                    <span className="text-gray-400 text-[10px] sm:text-xs text-left">Sintetizadores de propulsores, colisiones y potenciadores</span>
                                </div>
                                <button 
                                    onClick={toggleSound}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${soundEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Custom Music ID Input Panel */}
                            <div className="flex flex-col border-t border-white/5 pt-6 space-y-3">
                                <div className="flex flex-col pr-4 text-left">
                                    <span className="text-cyan-400 font-extrabold text-sm uppercase tracking-tight flex items-center gap-1.5 leading-none">
                                      🎵 ID / Música de Fondo Personalizada
                                    </span>
                                    <span className="text-gray-400 text-[10px] sm:text-xs text-left mt-2 leading-relaxed">
                                        ¡Ingresa un ID de video de YouTube (ej: <span className="font-mono text-cyan-300 pointer-events-auto select-all">5o8C4v_G78E</span> o <span className="font-mono text-cyan-300 pointer-events-auto select-all">dQw4w9WgXcQ</span>) o una URL de audio MP3 (.mp3) directa para reemplazar los efectos de sintetizador!
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={tempMusicId}
                                        onChange={(e) => setTempMusicId(e.target.value)}
                                        placeholder="Ej: dQw4w9WgXcQ o URL de audio..."
                                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs sm:text-sm flex-1 focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                    <button 
                                        onClick={() => handleCustomMusicIdChange(tempMusicId)}
                                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold text-xs uppercase px-4 rounded-xl transition-all cursor-pointer border border-cyan-500/30 whitespace-nowrap min-w-[120px]"
                                    >
                                        Poner Música
                                    </button>
                                    {customMusicId && (
                                        <button 
                                            onClick={() => {
                                                setTempMusicId('');
                                                handleCustomMusicIdChange('');
                                            }}
                                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs uppercase px-4 rounded-xl transition-all cursor-pointer border border-red-500/30"
                                            title="Remover música"
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Promo codes section */}
                        <div className="bg-black/55 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 w-full mb-6">
                            <h3 className="text-white font-black uppercase text-xs sm:text-sm tracking-widest mb-2 italic">🎁 CÓDIGOS PROMOCIONALES / CHEATS</h3>
                            <p className="text-gray-400 text-[10px] sm:text-xs mb-4 text-left">Introduce códigos de lanzamiento o trucos secretos para conseguir recursos y beneficios extremos!</p>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={promoCode} 
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Escribe tu código de cupon / truco aquí..."
                                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs sm:text-sm uppercase tracking-wider flex-1 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                                <button 
                                    onClick={() => applyPromoCode(promoCode)}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs sm:text-sm px-6 rounded-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                >
                                    INGRESAR
                                </button>
                            </div>

                            {promoMsg && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 p-3 rounded-xl border text-xs font-black text-center ${promoMsg.success ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}
                                >
                                    {promoMsg.text}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ) : showShop ? (
                    <motion.div 
                        key="shop"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full max-w-2xl flex flex-col items-center"
                    >
                        <div className="flex items-center gap-4 mb-6 sm:mb-8">
                            <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                            <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">
                                SKIN <span className="text-yellow-400">BOUTIQUE</span>
                            </h2>
                        </div>

                        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3 mb-6">
                            <Coins className="w-5 h-5 text-yellow-400" />
                            <span className="text-white font-black text-xl italic tracking-tighter">{credits.toLocaleString()} <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest pl-1">Credits</span></span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            {SKINS.map((s) => {
                                const isUnlocked = unlockedSkins.includes(s.type);
                                const isActive = activeSkin === s.type;
                                
                                return (
                                    <motion.div 
                                        key={s.type}
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${isActive ? 'bg-yellow-400/20 border-yellow-400' : 'bg-white/5 border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">{s.emoji}</div>
                                            <div>
                                                <h3 className="text-white font-black italic uppercase tracking-tighter leading-none">{s.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                    {isUnlocked ? 'Unlocked' : `${s.cost} Credits`}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {isUnlocked ? (
                                            <button 
                                                onClick={() => setActiveSkin(s.type)}
                                                disabled={isActive}
                                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase italic transition-all ${isActive ? 'bg-gray-700 text-gray-400 cursor-default' : 'bg-white text-black hover:bg-yellow-400 active:scale-95'}`}
                                            >
                                                {isActive ? 'Active' : 'Select'}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    if (credits >= s.cost) {
                                                        setCredits(c => c - s.cost);
                                                        setUnlockedSkins(prev => [...prev, s.type]);
                                                        setActiveSkin(s.type);
                                                    }
                                                }}
                                                disabled={credits < s.cost}
                                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase italic transition-all ${credits >= s.cost ? 'bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                                            >
                                                Buy
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : showBestiary ? (
                    <motion.div 
                        key="bestiary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full max-w-2xl flex flex-col items-center"
                    >
                        <div className="flex items-center gap-4 mb-4 sm:mb-6">
                            <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                            <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">
                                ENEMY <span className="text-orange-500">INTEL</span>
                            </h2>
                        </div>

                        {/* Interactive segment controls */}
                        <div className="flex bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10 mb-6 scale-95 sm:scale-100 shadow-xl items-center justify-between w-full max-w-md">
                          <button
                            onClick={() => setBestiaryTab('shop')}
                            className={`flex-1 text-center py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                              bestiaryTab === 'shop'
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-black shadow-lg font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Mercado IA Multiplicador
                          </button>
                          <button
                            onClick={() => setBestiaryTab('bio')}
                            className={`flex-1 text-center py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                              bestiaryTab === 'bio'
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-black shadow-lg font-black'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Bio-Firmas Bosses
                          </button>
                        </div>

                        {bestiaryTab === 'shop' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                            {BUYABLE_ENEMIES.map((enemy) => {
                              const isBought = boughtEnemies.includes(enemy.id);
                              return (
                                <motion.div
                                  key={enemy.id}
                                  whileHover={{ scale: 1.02 }}
                                  className={`p-4 rounded-3xl border-2 flex flex-col justify-between transition-all select-none text-left relative overflow-hidden backdrop-blur-md ${
                                    isBought 
                                      ? 'bg-orange-500/10 border-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                                      : 'bg-white/5 border-white/10 hover:border-orange-500/30'
                                  }`}
                                >
                                  {isBought && (
                                    <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                                      Adquirido
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-4 items-center mb-3">
                                    <div className="text-4xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner shrink-0 relative">
                                      {enemy.emoji}
                                    </div>
                                    <div>
                                      <h3 className="text-white font-black italic text-sm sm:text-base uppercase tracking-tight leading-none">{enemy.name}</h3>
                                      <p className="text-orange-400 font-extrabold text-xs tracking-wide mt-1">
                                        +{Math.round(enemy.mult * 100)}% Ganancia Total
                                      </p>
                                    </div>
                                  </div>

                                  <p className="text-gray-400 text-xs leading-snug mb-4">{enemy.desc}</p>

                                  <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-2xl border border-white/5">
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-wider">Costo</span>
                                      <span className="text-white font-bold text-xs">{enemy.cost.toLocaleString()} CR</span>
                                    </div>
                                    
                                    <button
                                      onClick={() => buyEnemy(enemy)}
                                      disabled={isBought || credits < enemy.cost}
                                      className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase italic transition-all ${
                                        isBought
                                          ? 'bg-transparent text-emerald-500 cursor-default font-extrabold flex items-center gap-1'
                                          : credits >= enemy.cost
                                            ? 'bg-orange-500 text-black hover:bg-orange-400 active:scale-95 shadow-md'
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                      }`}
                                    >
                                      {isBought ? '✓ Activo' : 'Adquirir'}
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <>
                            {loadingEnemies && (
                                <div className="flex flex-col items-center gap-4 py-20">
                                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                                    <p className="text-white font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Bio-Signatures...</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6 w-full mb-8">
                                {enemies.map((enemy, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 relative">
                                                {/* Generic sprite representation */}
                                                <div className={`w-16 h-16 rounded-full blur-xl animate-pulse absolute ${i === 0 ? 'bg-red-500' : 'bg-orange-900'}`} />
                                                <span className="text-4xl relative z-10">{i === 0 ? '🐦' : '👓'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{enemy.name}</h3>
                                                    <span className="bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Boss</span>
                                                </div>
                                                <p className="text-gray-400 text-sm leading-relaxed mb-4">{enemy.description}</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Health</span>
                                                        <span className="text-white font-bold">{enemy.hp} HP</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Speed</span>
                                                        <span className="text-white font-bold">{enemy.speed}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Attack</span>
                                                        <span className="text-white font-bold">{enemy.attackType}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Special</span>
                                                        <span className="text-white font-bold text-xs truncate" title={enemy.skills}>{enemy.skills}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                          </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                    key="ranking-station"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full max-w-xl flex flex-col items-center text-white"
                  >
                    {/* Glowing Header */}
                    <div className="flex flex-col items-center gap-2 mb-6 text-center select-none">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.7)] animate-bounce" />
                        <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">
                          RANKING <span className="text-red-500">STATION</span>
                        </h2>
                      </div>
                      <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest max-w-[340px] leading-relaxed">
                        ★ Estación de Medición Militar de Pilotos. Demuestra tu Poder ★
                      </p>
                    </div>

                    {/* Segmented Switch */}
                    <div className="flex bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10 mb-6 w-full max-w-sm shadow-lg">
                      <button
                        onClick={() => setRankingTab('global')}
                        className={`flex-1 py-1.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          rankingTab === 'global'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        🌐 Multijugador
                      </button>
                      <button
                        onClick={() => setRankingTab('legends')}
                        className={`flex-1 py-1.5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          rankingTab === 'legends'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        🏆 Leyendas
                      </button>
                    </div>

                    {/* Score list */}
                    <div className="w-full space-y-2.5 px-2">
                       {rankingTab === 'global' ? (
                         leaderboard.length > 0 ? (
                           leaderboard.map((entry, i) => (
                             <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={entry.userId} 
                                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                                  entry.userId === user?.uid 
                                    ? 'bg-red-500/15 border-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.15)] shadow-red-500/10' 
                                    : 'bg-black/40 border-white/5 hover:border-white/15'
                                }`}
                             >
                                <div className="flex items-center gap-3 sm:gap-4 text-white">
                                   <span className={`font-black italic text-xl sm:text-2xl w-6 sm:w-8 select-none text-center ${
                                     i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'
                                   }`}>
                                     {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                   </span>
                                   <div className="flex flex-col">
                                     <span className="text-white font-bold text-sm sm:text-base tracking-tight truncate max-w-[120px] sm:max-w-none">{entry.username}</span>
                                     <span className="text-[8px] font-black tracking-widest text-[#55efc4] uppercase">Combatiente Activo</span>
                                   </div>
                                   {entry.userId === user?.uid && (
                                     <span className="bg-red-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase scale-90 sm:scale-100 shadow-md">Tú</span>
                                   )}
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-red-500 font-extrabold text-lg sm:text-2xl tracking-tighter tabular-nums">{entry.score.toLocaleString()}</span>
                                  <span className="text-[7px] text-gray-500 uppercase tracking-widest font-extrabold text-white">pts de récord</span>
                                </div>
                             </motion.div>
                           ))
                         ) : (
                           <div className="bg-black/30 border border-white/5 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
                             <div className="text-4xl text-white">📡</div>
                             <p className="text-white text-xs font-bold uppercase tracking-widest">Enlazando con el Servidor Global...</p>
                             <p className="text-gray-500 text-[10px] uppercase tracking-wide leading-normal max-w-xs">
                               Inicia sesión con Google arriba o espera a que se recuperen los registros de la nube.
                             </p>
                           </div>
                         )
                       ) : (
                         /* Legends list */
                         [
                           { username: "Coronel Alpha Cow", score: 85002, badge: "🥇", label: "General de División" },
                           { username: "Comandante Torito", score: 54100, badge: "🥈", label: "Táctico Supremo" },
                           { username: "General Oink Oink", score: 42050, badge: "🥉", label: "Héroe de Cielos" },
                           { username: "Agente Kitty Core", score: 28400, badge: "🎖️", label: "Capitán de Vuelo" },
                           { username: "Bacon Volador", score: 12500, badge: "⭐", label: "Piloto Novato" }
                         ].map((legend, i) => (
                           <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={legend.username} 
                              className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-black/40 border-white/5 hover:border-white/10"
                           >
                              <div className="flex items-center gap-3 sm:gap-4 text-white">
                                 <span className="text-xl sm:text-2xl w-6 sm:w-8 text-center select-none">
                                   {legend.badge}
                                 </span>
                                 <div className="flex flex-col">
                                   <span className="text-white font-bold text-sm sm:text-base tracking-tight truncate max-w-[120px] sm:max-w-none">{legend.username}</span>
                                   <span className="text-[8px] font-black tracking-widest text-[#ffeaa7] uppercase">{legend.label}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-red-500 font-extrabold text-lg sm:text-2xl tracking-tighter tabular-nums text-red-500">{legend.score.toLocaleString()}</span>
                                <span className="text-[7px] text-gray-500 uppercase tracking-widest font-extrabold text-white">HISTÓRICO</span>
                              </div>
                           </motion.div>
                         ))
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {gameState === 'PAUSED' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center text-center p-4 sm:p-8 z-50 pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/60 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-3xl flex flex-col items-center w-full max-w-sm"
              >
                <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-yellow-500 rounded-full mb-6 sm:mb-8 shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-pulse" />
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tighter leading-none italic uppercase">
                  GAME <span className="text-yellow-400">PAUSED</span>
                </h2>
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs mb-8">
                  Combate Suspendido Temporalmente
                </p>

                <div className="flex flex-col gap-3.5 w-full">
                  <button 
                    onClick={() => setGameState('PLAYING')}
                    className="w-full px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl sm:rounded-2xl text-base font-black transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 italic uppercase tracking-tighter cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black text-black" />
                    Resume Game
                  </button>
                  <button 
                    onClick={resetGame}
                    className="w-full px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl sm:rounded-2xl text-base font-black transition-all active:scale-95 flex items-center justify-center gap-2 italic uppercase tracking-tighter cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restart Game
                  </button>
                  <button 
                    onClick={() => setGameState('LOBBY')}
                    className="w-full px-6 py-3.5 bg-red-650/10 hover:bg-red-650/20 text-red-400 border border-red-500/10 rounded-xl sm:rounded-2xl text-base font-black transition-all active:scale-95 flex items-center justify-center gap-2 italic uppercase tracking-tighter cursor-pointer"
                  >
                    Exit to Lobby
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-950/90 backdrop-blur-lg flex flex-col items-center justify-center text-center p-4 sm:p-8 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/40 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-3xl flex flex-col items-center w-full max-w-sm"
              >
                <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-red-600 rounded-full mb-6 sm:mb-8 shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
                {gameMode === 'MULTIPLAYER' ? (
                  <>
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tighter leading-none italic uppercase">
                      VICTORIA DEL <span className="text-red-550">CAOS 🦅</span>
                    </h2>
                    <p className="text-gray-300 text-xs px-2 mb-4 leading-relaxed font-semibold">
                      El Control de Kaos (Jugador 2) ha superado al Piloto de Toro agotando todo su combustible táctico.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl sm:text-7xl font-black text-white mb-2 tracking-tighter leading-none italic uppercase">
                      MISSION <span className="text-red-600">FAILED</span>
                    </h2>
                  </>
                )}
                <div className="my-6 sm:my-10 flex flex-col items-center">
                  <p className="text-red-400 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs mb-2 sm:mb-3">Combat Effectiveness</p>
                  <p className="text-white text-4xl sm:text-7xl font-black italic tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{score}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <button 
                    onClick={() => setGameState('LOBBY')}
                    className="w-full px-6 py-3.5 bg-white text-gray-900 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black hover:bg-gray-100 transition-all active:scale-95 shadow-xl italic uppercase tracking-tighter cursor-pointer"
                  >
                    Lobby
                  </button>
                  <button 
                    onClick={resetGame}
                    className="w-full px-6 py-3.5 bg-red-600 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-black hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-900/40 italic flex items-center justify-center gap-2 uppercase tracking-tighter cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === 'VICTORY' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/90 backdrop-blur-lg flex flex-col items-center justify-center text-center p-4 sm:p-8 z-50 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                 {Array.from({ length: 20 }).map((_, i) => (
                   <motion.div 
                     key={i}
                     initial={{ y: -50, x: Math.random() * GAME_WIDTH, opacity: 1 }}
                     animate={{ y: GAME_HEIGHT + 50, rotate: 360 }}
                     transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                     className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                   />
                 ))}
              </div>

              <motion.div
                initial={{ scale: 0.5, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="bg-black/40 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] border-4 border-emerald-500/30 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center relative z-10 backdrop-blur-xl w-full max-w-sm sm:max-w-md"
              >
                <div className="w-16 sm:w-20 h-1 sm:h-2 bg-emerald-500 rounded-full mb-6 sm:mb-10 shadow-[0_0_20px_#10b981]" />
                
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="mb-6 sm:mb-8"
                >
                   <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                </motion.div>

                {gameMode === 'MULTIPLAYER' ? (
                  <>
                    <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tighter leading-none italic uppercase">
                      VICTORIA DEL <span className="text-emerald-500">TORO 🐮</span>
                    </h2>
                    <p className="text-gray-300 text-xs px-2 mb-6 leading-relaxed font-semibold">
                      ¡Hazaña lograda! El Piloto de Toro (Jugador 1) resistió los embates aéreos y cruzó de forma invicta los dos mil quinientos puntos.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl sm:text-7xl font-black text-white mb-2 tracking-tighter leading-none italic uppercase">
                      MISSION <span className="text-emerald-500">DONE</span>
                    </h2>
                    <p className="text-emerald-300/80 font-black tracking-widest text-[10px] sm:text-sm uppercase mb-6 sm:mb-10 italic">Elite Grade Achieved</p>
                  </>
                )}
                
                <div className="mb-6 sm:mb-8 flex flex-col items-center bg-black/50 border border-white/10 px-6 py-4 rounded-2xl w-full">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 font-mono">RECOMPENSA DE MISIÓN</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    <span className="text-white text-3xl sm:text-4xl font-black italic tracking-tighter">+{sessionReward}</span>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold uppercase mt-2">Créditos Añadidos</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <button 
                    onClick={() => setGameState('LOBBY')}
                    className="w-full px-6 py-3 sm:py-5 bg-white text-gray-900 rounded-xl sm:rounded-2xl text-lg font-black hover:bg-gray-100 transition-all active:scale-95 shadow-xl italic uppercase tracking-tighter"
                  >
                    Lobby
                  </button>
                  <button 
                    onClick={resetGame}
                    className="w-full px-6 py-3 sm:py-5 bg-emerald-600 text-white rounded-xl sm:rounded-2xl text-lg font-black hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-emerald-900/40 italic uppercase tracking-tighter"
                  >
                    Endless
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === 'WORLD_DESTROY_PORTAL' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center p-4 sm:p-8 z-50 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-950/40 via-black to-black" />
              
              <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
                {worldDestroyProgress < 100 ? (
                  <div className="flex flex-col items-center">
                    <div className="w-60 bg-gray-900 border border-red-500/30 h-3 rounded-full mb-8 overflow-hidden relative shadow-lg">
                      <motion.div 
                        className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 h-full"
                        style={{ width: `${worldDestroyProgress}%` }}
                      />
                    </div>
                    
                    <div className="h-64 flex flex-col items-center justify-center relative mb-8">
                      {worldDestroyProgress >= 0 && worldDestroyProgress < 40 && (
                        <motion.div
                          animate={{ 
                            x: [0, -6, 6, -3, 3, 0],
                            y: [0, 4, -4, 2, -2, 0],
                            rotate: [0, -1, 1, -1, 0]
                          }}
                          transition={{ duration: 0.3, repeat: Infinity }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-8xl filter drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]">🌎</span>
                          <span className="text-4xl absolute -bottom-2 animate-bounce">🌋</span>
                          <p className="text-red-500 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest mt-10 animate-pulse font-mono max-w-sm text-center">
                            ⚠️ CHOQUE TEMPORAL DETECTADO... EL MUNDO COMIENZA A DESESTABILIZARSE ⚠️
                          </p>
                        </motion.div>
                      )}
                      
                      {worldDestroyProgress >= 40 && worldDestroyProgress < 75 && (
                        <motion.div className="flex flex-col items-center relative">
                          <motion.span 
                            animate={{ 
                              scale: [1, 1.3, 0.8],
                              y: [0, -20, 40],
                              opacity: [1, 1, 0]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-8xl filter drop-shadow-[0_0_50px_rgba(224,86,36,0.9)]"
                          >
                            💥
                          </motion.span>
                          <div className="absolute top-0 flex gap-4 text-3xl">
                            <motion.span animate={{ x: -100, y: -50, rotate: -360, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity }} className="filter drop-shadow-lg">🔥</motion.span>
                            <motion.span animate={{ x: 100, y: -70, rotate: 360, opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity }} className="filter drop-shadow-lg">☄️</motion.span>
                            <motion.span animate={{ x: -40, y: 120, rotate: -180, opacity: 0 }} transition={{ duration: 1.1, repeat: Infinity }} className="filter drop-shadow-lg">🌋</motion.span>
                            <motion.span animate={{ x: 50, y: 100, rotate: 180, opacity: 0 }} transition={{ duration: 1.3, repeat: Infinity }} className="filter drop-shadow-lg">🔥</motion.span>
                          </div>
                          <p className="text-red-500 font-black text-xs sm:text-sm uppercase tracking-widest mt-10 font-mono text-center max-w-sm">
                            🔥 ¡EL ESPACIO-TIEMPO SE COLAPSA! EL MUNDO ESTÁ SIENDO DESTRUIDO 🔥
                          </p>
                        </motion.div>
                      )}
                      
                      {worldDestroyProgress >= 75 && worldDestroyProgress < 100 && (
                        <motion.div className="flex flex-col items-center relative">
                          <motion.div 
                            animate={{ rotate: 360, scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                            className="w-40 h-40 rounded-full border-8 border-violet-500/30 border-t-cyan-400 bg-cyan-950/40 shadow-[0_0_50px_#06b6d4] flex items-center justify-center relative"
                          >
                            <div className="w-24 h-24 rounded-full bg-violet-950/60 border-4 border-dashed border-violet-400 animate-[spin_6s_linear_infinite]" />
                          </motion.div>
                          
                          <motion.span 
                            animate={{ 
                              scale: [1, 0.2], 
                              x: [120, 0], 
                              y: [80, 0], 
                              rotate: [0, 720] 
                            }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                            className="absolute text-5xl filter drop-shadow-[0_0_15px_#fff]"
                          >
                            🐄
                          </motion.span>
                          
                          <p className="text-cyan-400 font-extrabold text-xs sm:text-sm uppercase tracking-[0.2em] mt-10 font-mono text-center max-w-sm animate-pulse">
                            🌀 LA VACA ENTRA AL PORTAL INTERDIMENSIONAL 🌀
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="bg-black/85 p-6 sm:p-10 rounded-[2rem] border-4 border-red-500/30 shadow-[0_30px_60px_-12px_rgba(239,68,68,0.25)] flex flex-col items-center relative z-10 backdrop-blur-3xl w-full max-w-md"
                  >
                    <div className="w-20 h-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full mb-6 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse" />
                    
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      👑
                    </motion.div>
                    
                    <h2 className="text-3xl sm:text-5xl font-black text-white leading-none tracking-tighter uppercase italic text-center">
                      UNIVERSO <span className="text-red-500">DESTRUIDO</span>
                    </h2>
                    
                    <p className="text-red-400 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-6 sm:mb-8 italic text-center">
                      ¡Campaña Nivel 80 Completada!
                    </p>
                    
                    <div className="flex flex-col items-center bg-black/50 border border-red-500/10 px-5 py-4 rounded-xl w-full mb-6 text-center shadow-inner">
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5 font-mono">RECOMPENSA FINAL TEMPORAL</span>
                      <div className="flex items-center gap-1.5 justify-center">
                        <Coins className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        <span className="text-white text-3xl font-black italic tracking-tighter">+1,500</span>
                      </div>
                      <span className="text-red-400 text-[9px] font-black uppercase mt-2.5 tracking-wider animate-pulse">🔓 ¡MUNDO HARDCORE DESBLOQUEADO! 🔓</span>
                    </div>
                    
                    <p className="text-gray-400 text-[11px] leading-relaxed mb-6 text-center">
                      La destrucción cuántica del mundo ha desbloqueado una fisura temporal. Ahora puedes jugar el <strong className="text-red-400 font-extrabold">MODO HARDCORE</strong> desde el lobby para jugar con velocidad supercargada (x1.45), lluvia implacable de obstáculos y el doble de recompensas. Desafía el nuevo límite.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <button 
                        onClick={() => {
                          setIsHardcore(true);
                          localStorage.setItem('rocketbull_hardcore_active', 'true');
                          setGameState('LOBBY');
                        }}
                        className="w-full px-5 py-3 bg-white text-gray-900 rounded-xl text-sm font-black hover:bg-gray-100 transition-all active:scale-95 shadow-xl italic uppercase tracking-tighter cursor-pointer"
                      >
                        Ir al Lobby 🏠
                      </button>
                      <button 
                        onClick={() => {
                          setIsHardcore(true);
                          localStorage.setItem('rocketbull_hardcore_active', 'true');
                          setLevel(80);
                          resetGame();
                        }}
                        className="w-full px-5 py-3 bg-red-650 text-white rounded-xl text-sm font-black hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-900/40 italic uppercase tracking-tighter cursor-pointer"
                      >
                        Repetir Nivel 80 🔄
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Custom Music Background Player */}
      {musicEnabled && gameState !== 'SPLASH' && (
        <>
          {ytId && (
            <iframe 
              id="bg-music-youtube"
              width="0" 
              height="0" 
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&enablejsapi=1`} 
              allow="autoplay" 
              className="hidden pointer-events-none absolute w-0 h-0 opacity-0" 
            />
          )}
          {audioUrl && (
            <audio 
              id="bg-music-audio"
              src={audioUrl} 
              autoPlay 
              loop 
              className="hidden"
              ref={(el) => {
                if (el) {
                  el.volume = 0.35;
                }
              }}
            />
          )}
        </>
      )}

      <div className="hidden sm:flex mt-4 text-gray-500 text-[10px] gap-4 uppercase font-bold tracking-widest opacity-30">
        <span>RocketBull V2.0</span>
        <span>•</span>
        <span>Mobile Optimized</span>
      </div>
    </div>
  );
};
