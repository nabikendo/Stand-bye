// ==========================================
// 1. ATUALIZAÇÃO DO RELÓGIO DIGITAL
// ==========================================
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        clockElement.textContent = `${hours}:${minutes}`;
    }
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// 2. PROTEÇÃO ANTI-BURN-IN (OLED PIXEL SHIFT)
// ==========================================
// Desloca a tela milimetricamente a cada 60 segundos 
// para evitar imagens estáticas na tela AMOLED do S24 FE.
function applyPixelShift() {
    const container = document.getElementById('standby-container');
    if (!container) return;

    // Sorteia um deslocamento aleatório entre -4 e +4 pixels nos eixos X e Y
    const maxPixels = 4;
    const shiftX = Math.floor(Math.random() * (maxPixels * 2 + 1)) - maxPixels;
    const shiftY = Math.floor(Math.random() * (maxPixels * 2 + 1)) - maxPixels;

    // Aplica o deslocamento físico via CSS transform
    container.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
    
    console.log(`[Anti-Burn-In] Deslocamento aplicado: X=${shiftX}px, Y=${shiftY}px`);
}
// Executa o Pixel Shift a cada 1 minuto (60000ms) conforme as boas práticas
setInterval(applyPixelShift, 60000);

// ==========================================
// 3. MANTER A TELA DO NAVEGADOR ACESA (Wake Lock)
// ==========================================
let wakeLock = null;

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen Wake Lock ativo. A tela não vai apagar!');
        }
    } catch (err) {
        console.warn(`Não foi possível ativar o Wake Lock: ${err.message}`);
    }
}

// Ativa quando a página é carregada
window.addEventListener('load', requestWakeLock);

// Reativa se o usuário alternar de aba e voltar
document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});
// ==========================================
// PWA: REGISTRO DO SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './'
      });
      console.log('[Stand-bye PWA] Service Worker registrado com sucesso no escopo:', registration.scope);
    } catch (error) {
      console.error('[Stand-bye PWA] Falha ao registrar o Service Worker:', error);
    }
  });
}

// ==========================================
// AUXILIAR DE TELA CHEIA E ROTAÇÃO (S24 FE)
// ==========================================
async function lockLandscapeFullscreen() {
  try {
    // Caso o usuário abra pelo navegador comum antes de instalar o PWA
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    // Força a orientação landscape via API (suportado no Chrome/Android em fullscreen)
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (err) {
    console.warn('[Stand-bye] Orientação já controlada pelo Manifesto PWA ou exige gesto do usuário:', err.message);
  }
}

// Dispara ao tocar na tela (exigência de segurança dos navegadores mobile)
document.addEventListener('click', lockLandscapeFullscreen, { once: true });
