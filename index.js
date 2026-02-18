const dgram = require('dgram');
const client = dgram.createSocket('udp4');

// --- AYARLAR ---
const SERVER_IP = '51.38.205.167';     // Örn: 185.123.45.67
const SERVER_PORT = 11451;            // Örn: 27015
const BOT_NAME = 'Aktif_Bot_724';     // Sunucuda görünecek isim
// ---------------

console.log(`Bot baslatildi: ${SERVER_IP}:${SERVER_PORT}`);

// Sunucuya "Bana kod ver" (challenge) diyen fonksiyon
function getChallenge() {
    const msg = Buffer.from('\xff\xff\xff\xffgetchallenge valve\n', 'binary');
    client.send(msg, SERVER_PORT, SERVER_IP, (err) => {
        if (err) console.error("Hata:", err);
    });
    console.log(`[${new Date().toLocaleTimeString()}] Sinyal gonderildi...`);
}

// Sunucudan cevap gelince burasi calisir
client.on('message', (msg) => {
    const response = msg.toString('binary');

    // Eğer sunucu bize challenge kodu gönderirse, asıl bağlantıyı yapıyoruz
    if (response.includes('challenge')) {
        const challengeNumber = response.split(' ')[1].trim().split(' ')[0];
        console.log(`Challenge alindi: ${challengeNumber}`);

        // CS 1.6 Connect Paketi (En stabil versiyon 48)
        const connectStr = `\xff\xff\xff\xffconnect 48 ${challengeNumber} "${BOT_NAME}" ""\n`;
        const connectPacket = Buffer.from(connectStr, 'binary');

        client.send(connectPacket, SERVER_PORT, SERVER_IP, () => {
            console.log(`[BAŞARILI] ${BOT_NAME} sunucuya baglandi!`);
        });
    }
});

// Her 25 saniyede bir bağlantıyı tazele (Lemehost kapanmasın diye)
setInterval(getChallenge, 25000);

// İlk başlatma
getChallenge();

// GitHub Actions'ın kapanmaması için sonsuz döngü logu
setInterval(() => {
    console.log("Bot hayatta...");

}, 300000); // 5 dakikada bir "hayattayım" yazısı
