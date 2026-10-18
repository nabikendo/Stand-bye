// =========================================================
// CONFIGURAÇÃO INSPIRADA NO DUMP DO APK (StandBy Mode Pro)
// =========================================================
const StandByeConfig = {
  isNightModeOn: true,                 // Ativa o filtro vermelho escuro
  amoledDriftEnabled: true,            // Pixel shift (-6px a +6px)
  blinkingSeparator: true,             // Piscar os dois-pontos ":"
  isAutoPauseOnPortraitEnabled: true,  // Pausa ao colocar o S24 FE em pé
  isAutoCloseOnUnplugCharger: false    // Pode ser ativado para avisar quando tirar do cabo
};

const StandByeState = {
  isCharging: false,
  batteryPercentage: 100,
  isPortrait: false
};

// 1. Inicializa o Modo Noturno (Red Tint)
function applyNightMode() {
  document.body.classList.toggle('night-mode', StandByeConfig.isNightModeOn);
}

// 2. Monitor de Bateria (Equivalente ao BatteryChrgTracker do APK)
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

// 3. Detector de Orientação (isAutoCloseOnPortraitEnabled)
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

// 4. Toque Duplo para alternar Modo Noturno Vermelho / Branco (canDoubleTap)
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
  applyNightMode();
  initBatteryTracker();
  initOrientationGuard();
});
