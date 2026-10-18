// Relógio em tempo real
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('digital-clock').textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Detectar Bateria e Estado de Carregamento (Battery Status API)
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        function updateBatteryInfo() {
            const statusText = battery.charging ? `Carregando: ${Math.round(battery.level * 100)}%` : `Bateria: ${Math.round(battery.level * 100)}%`;
            document.getElementById('battery-status').textContent = statusText;
        }
        updateBatteryInfo();
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
    });
}
