const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

// Webhook URL'ini buraya ekle
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1472516284326609037/vdM6SdIg6C82k0LszcnKYP2R-xbWb-Kva1ANazFyBcnFkRIIIN1BMIqIoYFTLGXyg0Ig';

// Chat loglarını kaydetmek için dosya
const logFile = path.join(__dirname, 'chat_logs.txt');

// Bot yapılandırması
const bot = mineflayer.createBot({
  host: 'zurnacraft.net', // Sunucu adresini buraya yaz
  port: 25565, // Port numarası (varsayılan 25565)
  username: 'salbeni',
  version: false, // false = otomatik sürüm algılama (önerilen)
  auth: 'offline', // Cracked sunucu için
  hideErrors: false, // Hataları göster
  checkTimeoutInterval: 30000, // 30 saniye timeout kontrolü
  logErrors: true
});

// Discord webhook'a mesaj gönderme fonksiyonu
async function sendToWebhook(message) {
  try {
    const https = require('https');
    const url = require('url');
    const webhookUrl = new URL(WEBHOOK_URL);
    
    const data = JSON.stringify({
      content: message,
      username: 'Minecraft Bot - swordht3'
    });
    
    const options = {
      hostname: webhookUrl.hostname,
      path: webhookUrl.pathname + webhookUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {});
    req.on('error', (error) => {
      console.error('Webhook hatası:', error);
    });
    req.write(data);
    req.end();
  } catch (error) {
    console.error('Webhook gönderim hatası:', error);
  }
}

// Chat loglarını kaydet
function logChat(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage.trim());
  
  // Webhook'a da gönder
  sendToWebhook(`[${timestamp}] ${message}`);
}

// Bot spawn olduğunda (her seferinde çalışır)
bot.on('spawn', () => {
  console.log('Bot sunucuya bağlandı!');
  logChat('Bot sunucuya bağlandı');
  
  // 3 saniye bekle ve login yap
  setTimeout(() => {
    try {
      bot.chat('/login benbitben');
      console.log('Login komutu gönderildi');
      logChat('Login komutu gönderildi: /login benbitben');
    } catch (error) {
      console.error('Login hatası:', error);
      logChat(`HATA: Login - ${error.message}`);
      return;
    }
    
    // 3 saniye sonra envanter işlemlerini yap
    setTimeout(async () => {
      try {
        // Bot hala bağlı mı kontrol et
        if (!bot.entity) {
          logChat('HATA: Bot entity bulunamadı, işlemler iptal edildi');
          return;
        }
        
        logChat('Envanter işlemleri başlatılıyor...');
        
        // 5. slotu seç (index 4, çünkü 0'dan başlar)
        try {
          bot.setQuickBarSlot(4);
          console.log('5. slot seçildi');
          logChat('Envanter 5. slot seçildi');
        } catch (error) {
          logChat(`UYARI: Slot seçimi atlandı - ${error.message}`);
        }
        
        // 3 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Bot hala bağlı mı kontrol et
        if (!bot.entity) {
          logChat('HATA: Bot bağlantısı kesildi');
          return;
        }
        
        // Sağ tık (eşyayı kullan) - try-catch ile koru
        try {
          bot.activateItem();
          console.log('Sağ tık yapıldı');
          logChat('5. slottaki eşya kullanıldı (sağ tık)');
        } catch (error) {
          logChat(`UYARI: Sağ tık atlandı - ${error.message}`);
          // Hata olsa bile devam et
        }
        
        // 3 saniye bekle menünün açılması için
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Açılan pencerede 24. slota tıkla - sadece pencere varsa
        try {
          const window = bot.currentWindow;
          if (window && window.slots && window.slots.length > 23) {
            // Slot 24'e tıkla (index 23)
            await bot.clickWindow(23, 0, 0);
            console.log('24. slot tıklandı');
            logChat('Açılan pencerede 24. slot tıklandı');
            
            // 3 saniye bekle
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Pencereyi kapat
            bot.closeWindow(window);
            logChat('Pencere kapatıldı');
          } else {
            logChat('UYARI: Pencere açılmadı veya yeterli slot yok, atlandı');
          }
        } catch (error) {
          logChat(`UYARI: Pencere işlemi atlandı - ${error.message}`);
          // Hata olsa bile devam et
        }
        
        // 3 saniye sonra AFK yap
        setTimeout(() => {
          try {
            if (bot.entity) {
              bot.chat('/afk');
              console.log('AFK komutu gönderildi');
              logChat('AFK komutu gönderildi: /afk');
            }
          } catch (error) {
            console.error('AFK hatası:', error);
            logChat(`HATA: AFK komutu - ${error.message}`);
          }
        }, 3000);
        
      } catch (error) {
        console.error('Envanter işlemi hatası:', error);
        logChat(`HATA: Envanter işlemi - ${error.message}`);
      }
    }, 3000);
    
  }, 3000);
});

// Chat mesajlarını dinle ve kaydet
bot.on('message', (message) => {
  const chatMessage = message.toString();
  logChat(`CHAT: ${chatMessage}`);
});

// Whisper mesajlarını dinle
bot.on('whisper', (username, message) => {
  logChat(`WHISPER [${username}]: ${message}`);
});

// Kick edilirse
bot.on('kicked', (reason) => {
  let kickReason = reason;
  try {
    // NBT objesini string'e çevir
    if (typeof reason === 'object' && reason !== null) {
      kickReason = JSON.stringify(reason, null, 2);
      // Eğer text alanı varsa onu al
      if (reason.value && reason.value.text && reason.value.text.value) {
        kickReason = reason.value.text.value;
      }
    }
  } catch (e) {
    kickReason = String(reason);
  }
  console.log('Bot kicklendi:', kickReason);
  logChat(`Bot sunucudan kicklendi: ${kickReason}`);
});

// Hata durumunda
bot.on('error', (err) => {
  console.error('Bot hatası:', err);
  logChat(`HATA: ${err.message}`);
});

// Bağlantı sonlandığında
bot.on('end', () => {
  console.log('Bot bağlantısı kesildi');
  logChat('Bot bağlantısı sonlandı');
  
  // 5 saniye sonra yeniden bağlan
  console.log('5 saniye sonra yeniden bağlanılacak...');
  setTimeout(() => {
    console.log('Yeniden başlatılıyor...');
    // Bot'u yeniden başlatmak için process'i yeniden başlat
    process.exit(1); // PM2 veya nodemon gibi bir process manager kullanılıyorsa otomatik restart yapar
  }, 5000);
});

console.log('Bot başlatılıyor...');
logChat('Bot başlatılıyor...');


