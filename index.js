const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const SERVER_IP = '51.38.205.167'; 
const SERVER_PORT = 11451;     
const BOT_NAME = 'Lemehost_Bot_724';

console.log(`Bot baslatildi: ${SERVER_IP}:${SERVER_PORT}`);

function sendQuery() {
    // 1. Alternatif: A2S_INFO (Sunucuya "Kim var orada?" diye sorar)
    const ping = Buffer.from('\xff\xff\xff\xffTSource Engine Query\x00', 'binary');
    client.send(ping, SERVER_PORT, SERVER_IP);

    // 2. Alternatif: GetChallenge (Bağlanmak için kod ister)
    const challenge = Buffer.from('\xff\xff\xff\xffgetchallenge valve\n', 'binary');
    client.send(challenge, SERVER_PORT, SERVER_IP);
    
    console.log(`[${new Date().toLocaleTimeString()}] Sinyal gonderildi, cevap bekleniyor...`);
}

client.on('message', (msg) => {
    const response = msg.toString('binary');
    console.log("Sunucudan cevap geldi!"); // Herhangi bir cevap gelirse logda görelim

    if (response.includes('challenge')) {
        const challengeNumber = response.split(' ')[1].trim().split(' ')[0];
        console.log(`Challenge alindi: ${challengeNumber}`);
        const connectStr = `\xff\xff\xff\xffconnect 48 ${challengeNumber} "${BOT_NAME}" ""\n`;
        client.send(Buffer.from(connectStr, 'binary'), SERVER_PORT, SERVER_IP);
        console.log("Baglanti paketi gonderildi!");
    }
});

// Hataları yakala
client.on('error', (err) => {
    console.error("Soket Hatası:", err);
});

setInterval(sendQuery, 20000);
sendQuery();

// GitHub Actions kapanmasın diye
setInterval(() => { console.log("Bot calisiyor..."); }, 60000);
