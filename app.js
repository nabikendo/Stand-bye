// =========================================================
// CONFIGURAÇÃO INSPIRADA NO DUMP DO APK (StandBy Mode Pro)
// =========================================================
const StandByeConfig = {
  isNightModeOn: true,                 // Ativa o filtro vermelho escuro
  amoledDriftEnabled: true,            // Ativa o Pixel shift macro
  driftRangePx: 4,                     // Raio máximo de movimento do relógio (-4px a +4px)
  blinkingSeparator: true,             // Piscar os dois-pontos ":"
  isAutoPauseOnPortraitEnabled: true,  // Pausa ao colocar o S24 FE em pé
  isAutoCloseOnUnplugCharger: false    
};

const StandByeState = {
  isCharging: false,
  batteryPercentage: 100,
  isPortrait: false
};

// 1. Relógio em tempo real
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  // Atualiza data simples
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'short' };
  const dateStr = now.toLocaleDateString('pt-BR', dateOptions);
  
  const clockEl = document.getElementById('digital-clock');
  const dateEl = document.getElementById('current-date');
  
  if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
  if (dateEl) dateEl.textContent = dateStr;
}
setInterval(updateClock, 1000);

// 2. Inicializa o Modo Noturno (Red Tint)
function applyNightMode() {
  document.body.classList.toggle('night-mode', StandByeConfig.isNightModeOn);
}

// 3. Monitor de Bateria (Equivalente ao BatteryChrgTracker do APK)
async function initBatteryTracker() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      
      const updateBatteryStatus = () => {
        StandByeState.isCharging = battery.charging;
        StandByeState.batteryPercentage = Math.round(battery.level * 100);
        
        const badgeEl = document.getElementById('battery-badge');
        if (badgeEl) {
          const bolt = StandByeState.isCharging ? '⚡ ' : '';
          badgeEl.textContent = `${bolt}${StandByeState.batteryPercentage}%`;
        }
      };

      updateBatteryStatus();
      battery.addEventListener('chargingchange', updateBatteryStatus);
      battery.addEventListener('levelchange', updateBatteryStatus);
    } catch (e) {
      console.warn('[Stand-bye] Battery API indisponível:', e);
    }
  }
}

// 4. Detector de Orientação (isAutoPauseOnPortraitEnabled)
function initOrientationGuard() {
  const checkOrientation = () => {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    StandByeState.isPortrait = isPortrait;
    const warningEl = document.getElementById('portrait-warning');
    if (warningEl && StandByeConfig.isAutoPauseOnPortraitEnabled) {
      warningEl.classList.toggle('active', isPortrait);
    }
  };

  window.addEventListener('resize', checkOrientation);
  checkOrientation();
}

// 5. PROTEÇÃO ANTI-BURN-IN: PIXEL SHIFT MACRO + CHECKERBOARD MICRO INVERT
let checkerboardPhase = false;

function applyPixelShift() {
  if (!StandByeConfig.amoledDriftEnabled) return;
  
  const container = document.getElementById('standby-container');
  const overlay = document.getElementById('checkerboard-overlay');
  
  if (!container) return;

  // 5.1 Deslocamento macro do bloco de conteúdo (Drift)
  const range = StandByeConfig.driftRangePx;
  const randomX = Math.floor(Math.random() * (range * 2 + 1)) - range;
  const randomY = Math.floor(Math.random() * (range * 2 + 1)) - range;

  container.style.transform = `translate3d(${randomX}px, ${randomY}px, 0)`;

  // 5.2 Deslocamento micro da máscara Checkerboard (Inverte os subpixels em 1px)
  if (overlay) {
    checkerboardPhase = !checkerboardPhase;
    const shiftX = checkerboardPhase ? '1px' : '0px';
    const shiftY = checkerboardPhase ? '1px' : '0px';
    overlay.style.backgroundPosition = `${shiftX} ${shiftY}`;
  }
}
// Dispara o Pixel Shift e inversão do xadrez a cada 60 segundos
setInterval(applyPixelShift, 60000);

// 6. Toque Duplo para alternar Modo Noturno Vermelho / Branco
let lastTapTime = 0;
document.addEventListener('touchend', (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;
  if (tapLength < 300 && tapLength > 0) {
    StandByeConfig.isNightModeOn = !StandByeConfig.isNightModeOn;
    applyNightMode();
    e.preventDefault();
  }
  lastTapTime = currentTime;
});

// Inicialização Geral
window.addEventListener('DOMContentLoaded', () => {
  updateClock();
  applyNightMode();
  initBatteryTracker();
  initOrientationGuard();
  applyPixelShift(); // Executa o primeiro shift imediatamente
});
