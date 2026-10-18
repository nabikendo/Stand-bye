// =========================================================
// CONFIGURAÇÃO E ESTADO GLOBAL (Stand-bye Mode Pro)
// =========================================================
const StandByeConfig = {
  isNightModeOn: true,                 // Inicia no modo vermelho escuro (AMOLED Safe)
  amoledDriftEnabled: true,            // Ativa o Pixel Shift a cada 60s
  driftRangePx: 4,                     // Deslocamento entre -4px e +4px
  driftIntervalMs: 60000,              // 60 segundos
  blinkingSeparator: true,             // Dois-pontos ":" piscando
  isAutoPauseOnPortraitEnabled: true   // Exibe aviso preto quando o S24 FE está em pé
};

const StandByeState = {
  isCharging: false,
  batteryPercentage: 100,
  isPortrait: false,
  wakeLockSentinel: null
};

// =========================================================
// 1. RELÓGIO DIGITAL E DATA (AMOLED_CLOCK_DUO)
// =========================================================
function updateClock() {
  const now = new Date();
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const dateEl = document.getElementById('clock-date');

  if (hoursEl) hoursEl.textContent = hours;
  if (minutesEl) minutesEl.textContent = minutes;

  if (dateEl) {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
    // Formata ex: "DOM., 18 DE OUT." -> "DOM, 18 OUT"
    dateEl.textContent = formatter.format(now)
      .replace(/\./g, '')
      .replace(' de ', ' ')
      .toUpperCase();
  }
}

// =========================================================
// 2. PROTEÇÃO ANTI-BURN-IN (PIXEL SHIFT / DRIFT)
// =========================================================
function applyPixelShift() {
  if (!StandByeConfig.amoledDriftEnabled) return;
  
  const container = document.getElementById('standby-container');
  if (!container) return;

  const range = StandByeConfig.driftRangePx;
  // Sorteia inteiro entre -range e +range (ex: -4px a +4px)
  const randomX = Math.floor(Math.random() * (range * 2 + 1)) - range;
  const randomY = Math.floor(Math.random() * (range * 2 + 1)) - range;

  container.style.transform = `translate3d(${randomX}px, ${randomY}px, 0)`;
}

// =========================================================
// 3. MODO NOTURNO VERMELHO (customNightModeTintConfig)
// =========================================================
function applyNightMode() {
  document.body.classList.toggle('night-mode', StandByeConfig.isNightModeOn);
}

// =========================================================
// 4. MONITOR DE BATERIA (Battery Status API + Anel SVG)
// =========================================================
async function initBatteryTracker() {
  const badgeEl = document.getElementById('battery-badge');
  const progressCircle = document.getElementById('battery-progress');
  const stateLabel = document.getElementById('charging-state-label');
  const circumference = 2 * Math.PI * 52; // r = 52 -> ~326.72

  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();

      const updateBatteryUI = () => {
        StandByeState.isCharging = battery.charging;
        StandByeState.batteryPercentage = Math.round(battery.level * 100);

        if (badgeEl) {
          const bolt = StandByeState.isCharging ? '⚡' : '';
          badgeEl.textContent = `${bolt}${StandByeState.batteryPercentage}%`;
        }

        if (progressCircle) {
          const offset = circumference - (StandByeState.batteryPercentage / 100) * circumference;
          progressCircle.style.strokeDashoffset = offset;
        }

        if (stateLabel) {
          if (StandByeState.batteryPercentage === 100 && StandByeState.isCharging) {
            stateLabel.textContent = 'Carga Completa';
          } else {
            stateLabel.textContent = StandByeState.isCharging ? 'Carregando' : 'Na Bateria';
          }
        }
      };

      updateBatteryUI();
      battery.addEventListener('chargingchange', updateBatteryUI);
      battery.addEventListener('levelchange', updateBatteryUI);
    } catch (error) {
      console.warn('[Stand-bye] Erro ao ler Battery Status API:', error);
    }
  } else {
    if (badgeEl) badgeEl.textContent = '100%';
    if (stateLabel) stateLabel.textContent = 'Modo Cabeceira';
  }
}

// =========================================================
// 5. DETECTOR DE ORIENTAÇÃO (isAutoCloseOnPortraitEnabled)
// =========================================================
function initOrientationGuard() {
  const checkOrientation = () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    StandByeState.isPortrait = isPortrait;
    
    const warningEl = document.getElementById('portrait-warning');
    if (warningEl && StandByeConfig.isAutoPauseOnPortraitEnabled) {
      warningEl.classList.toggle('active', isPortrait);
    }
  };

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);
  checkOrientation();
}

// =========================================================
// 6. SCREEN WAKE LOCK API (IMPEDE A TELA DO S24 FE DE APAGAR)
// =========================================================
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      StandByeState.wakeLockSentinel = await navigator.wakeLock.request('screen');
      StandByeState.wakeLockSentinel.addEventListener('release', () => {
        console.log('[Stand-bye] Screen Wake Lock liberado.');
      });
      console.log('[Stand-bye] Screen Wake Lock ativo.');
    } catch (err) {
      console.warn('[Stand-bye] Wake Lock requer interação ou permissão:', err.message);
    }
  }
}

// Reativa o Wake Lock quando a aba/PWA volta a ficar visível
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

// =========================================================
// 7. GESTOS: TOQUE DUPLO E FULLSCREEN/LANDSCAPE LOCK
// =========================================================
let lastTapTime = 0;

document.addEventListener('touchend', (e) => {
  const currentTime = Date.now();
  const tapInterval = currentTime - lastTapTime;

  if (tapInterval > 0 && tapInterval < 300) {
    // Alterna Modo Noturno Vermelho / Modo Claro
    StandByeConfig.isNightModeOn = !StandByeConfig.isNightModeOn;
    applyNightMode();
    e.preventDefault();
  }
  lastTapTime = currentTime;
});

// Fallback para clique duplo (útil ao testar no navegador do PC)
document.addEventListener('dblclick', () => {
  StandByeConfig.isNightModeOn = !StandByeConfig.isNightModeOn;
  applyNightMode();
});

// Força Tela Cheia e orientação Paisagem no primeiro toque na tela
async function lockLandscapeFullscreen() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (err) {
    console.log('[Stand-bye] Orientação controlada pelo Manifesto PWA:', err.message);
  }
  requestWakeLock();
}

document.addEventListener('click', lockLandscapeFullscreen, { once: true });

// =========================================================
// 8. PWA: REGISTRO DO SERVICE WORKER
// =========================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './'
      });
      console.log('[Stand-bye PWA] Service Worker ativo no escopo:', registration.scope);
    } catch (error) {
      console.error('[Stand-bye PWA] Erro ao registrar Service Worker:', error);
    }
  });
}

// =========================================================
// INICIALIZAÇÃO DO SISTEMA
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  applyNightMode();
  updateClock();
  setInterval(updateClock, 1000);
  
  applyPixelShift();
  setInterval(applyPixelShift, StandByeConfig.driftIntervalMs);
  
  initBatteryTracker();
  initOrientationGuard();
  requestWakeLock();
});
