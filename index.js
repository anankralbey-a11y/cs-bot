const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const SERVER_IP = '51.38.205.167'; 
const SERVER_PORT = 11451;     
const BOT_NAME = 'Lemehost_Aktif_724';

console.log(`Bot baslatildi: ${SERVER_IP}:${SERVER_PORT}`);

function sendPing() {
    // 1. Adım: Sunucudan bağlantı şifresi (challenge) iste
    const challengeReq = Buffer.from('\xff\xff\xff\xffgetchallenge valve\n', 'binary');
    client.send(challengeReq, SERVER_PORT, SERVER_IP);
    console.log(`[${new Date().toLocaleTimeString()}] Baglanti istegi gonderildi...`);
}

client.on('message', (msg) => {
    const response = msg.toString('binary');
    
    if (response.includes('challenge')) {
        // Sunucudan gelen rakamı temizle
        const challengeNumber = response.split(' ')[1].trim().split(' ')[0];
        console.log(`Challenge onaylandi: ${challengeNumber}`);

        // 2. Adım: GERÇEKÇİ CONNECT PAKETİ
        // İçinde model, hız ayarları ve detaylar var
        const userInfo = `\\prot\\4\\unique\\0\\raw\\0\\name\\${BOT_NAME}\\model\\gordon\\topcolor\\30\\bottomcolor\\6\\rate\\25000\\cl_updaterate\\101\\cl_lw\\1\\cl_lc\\1\\+voicerecord\\1`;
        const connectStr = `\xff\xff\xff\xffconnect 48 ${challengeNumber} "${BOT_NAME}" "${userInfo}"\n`;
        
        const connectPacket = Buffer.from(connectStr, 'binary');
        
        // Sunucuya gönder
        client.send(connectPacket, SERVER_PORT, SERVER_IP, () => {
            console.log(`[OK] ${BOT_NAME} olarak giris yapildi!`);
        });

        // Sunucuda kalmaya devam etmek için "Hala buradayım" sinyali (Saniye bası küçük paket)
        setInterval(() => {
            const heartBeat = Buffer.from('\xff\xff\xff\xffping\n', 'binary');
            client.send(heartBeat, SERVER_PORT, SERVER_IP);
        }, 5000);
    }
});

// Hataları yakala (Bağlantı koparsa durmasın)
client.on('error', (err) => {
    console.error("Soket Hatası:", err);
});

// Her 20 saniyede bir giris denemesi yap (Eger sunucudan atilirsa geri girsin)
setInterval(sendPing, 20000);
sendPing();

// GitHub Actions kapanmasın diye log bas
setInterval(() => { console.log("Bot baglantisi taze tutuluyor..."); }, 60000);
