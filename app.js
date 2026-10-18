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
