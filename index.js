const dgram = require('dgram');
const http = require('http');

// AYARLAR
const SERVER_IP = '51.38.205.167'; // Buraya Lemehost IP'sini yaz
const SERVER_PORT = 11451;            // Buraya portu yaz
const BOT_NAME = '724_Bot_Aktif';      // Sunucuda görünecek isim

const client = dgram.createSocket('udp4');

// 1. ADIM: Sunucuya "Ben geldim, bana kod ver" (getchallenge) diyoruz.
function sendChallenge() {
    console.log(`[${new Date().toLocaleTimeString()}] Challenge isteği gönderiliyor...`);
    const msg = Buffer.from('\xff\xff\xff\xffgetchallenge valve\n', 'binary');
    client.send(msg, SERVER_PORT, SERVER_IP);
}

// 2. ADIM: Sunucudan gelen cevabı dinle
client.on('message', (msg, rinfo) => {
    const response = msg.toString('binary');
    
    if (response.includes('challenge')) {
        const challengeNumber = response.split(' ')[1].replace('\n', '').trim();
        console.log(`[OK] Challenge alındı: ${challengeNumber}`);
        
        // 3. ADIM: Connect paketi gönder (Sahte oyuncu girişi)
        // Bu paket sunucuda bir slot kaplamamızı sağlar
        const connectPacket = Buffer.from(
            `\xff\xff\xff\xffconnect 48 ${challengeNumber} "${BOT_NAME}" ""\n`, 
            'binary'
        );
        
        client.send(connectPacket, SERVER_PORT, SERVER_IP, () => {
            console.log(`[BAŞARILI] ${BOT_NAME} sunucuya bağlandı.`);
        });
    }
});

// Botun düşmemesi için her 30 saniyede bir sinyal tazele
setInterval(() => {
    sendChallenge();
}, 30000);

// İlk başlatma
sendChallenge();

// HUGGING FACE İÇİN WEB SERVER (Zorunlu)
// Hugging Face, bir port dinlemezsen "Uygulama çöktü" der.
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('CS 1.6 Botu Aktif!\n');
}).listen(7860, '0.0.0.0', () => {
    console.log('Web sunucusu 7860 portunda çalışıyor.');
});