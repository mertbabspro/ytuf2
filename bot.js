const mineflayer = require('mineflayer')
const fs = require('fs')
const path = require('path')
const https = require('https')

// Webhook URL buraya
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1472516284326609037/vdM6SdIg6C82k0LszcnKYP2R-xbWb-Kva1ANazFyBcnFkRIIIN1BMIqIoYFTLGXyg0Ig'
const logFile = path.join(__dirname, 'chat_logs.txt')

function createBot() {

  const bot = mineflayer.createBot({
    host: 'zurnacraft.net',
    port: 25565,
    username: '54sigma54afk', // Sabit isim
    version: '1.21.4',
    auth: 'offline',
    hideErrors: false
  })

  function logChat(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}\n`
    fs.appendFile(logFile, logMessage, () => {})
    console.log(logMessage.trim())
    sendToWebhook(logMessage.trim())
  }

  // Discord webhook fonksiyonu
  function sendToWebhook(message) {
    try {
      const webhookUrl = new URL(WEBHOOK_URL)
      const data = JSON.stringify({
        content: message,
        username: 'Minecraft Bot - Fevri03'
      })

      const options = {
        hostname: webhookUrl.hostname,
        path: webhookUrl.pathname + webhookUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }

      const req = https.request(options, (res) => {})
      req.on('error', (err) => {
        console.error('Webhook hatası:', err)
      })
      req.write(data)
      req.end()
    } catch (e) {
      console.error('Webhook gönderim hatası:', e)
    }
  }

  bot.on('login', () => {
    logChat('Login packet alındı')
  })

  bot.once('spawn', async () => {
    logChat('Spawn oldu')

    await bot.waitForTicks(60) // insan gibi delay

    // Kamera rastgele bakış
    bot.look((Math.random() - 0.5) * Math.PI, (Math.random() - 0.5) * Math.PI)
    await bot.waitForTicks(30)

    // Küçük ileri hareket
    bot.setControlState('forward', true)
    await bot.waitForTicks(20 + Math.floor(Math.random() * 20))
    bot.setControlState('forward', false)

    await bot.waitForTicks(60)

    // Login
    bot.chat('/login benbitben')
    logChat('Login komutu gönderildi')

    await bot.waitForTicks(140)

    if (!bot.entity) return

    try {
      // Slot seç
      bot.setQuickBarSlot(4)
      await bot.waitForTicks(60)

      // Sağ tık
      bot.activateItem()
      logChat('5. slot kullanıldı (sağ tık)')

      await bot.waitForTicks(120)

      // GUI slot tıklama
      const window = bot.currentWindow
      if (window && window.slots.length > 23) {
        await bot.clickWindow(23, 0, 0)
        logChat('24. slot tıklandı')
        await bot.waitForTicks(60)
        bot.closeWindow(window)
        logChat('Pencere kapatıldı')
      }

      await bot.waitForTicks(80)
      bot.chat('/home 1')
      logChat('/home 1 gönderildi')

    } catch (err) {
      logChat('GUI hata: ' + err.message)
    }
  })

  bot.on('message', (msg) => {
    logChat('CHAT: ' + msg.toString())
  })

  bot.on('whisper', (username, message) => {
    logChat(`WHISPER [${username}]: ${message}`)
  })

  bot.on('kicked', (reason) => {
    try {
      logChat('Kick reason: ' + JSON.stringify(reason))
    } catch {
      logChat('Kick reason: ' + String(reason))
    }
  })

  bot.on('error', (err) => {
    logChat('ERROR: ' + err.message)
  })

  bot.on('end', () => {
    logChat('Bağlantı kesildi. 15 saniye sonra yeniden bağlanıyor...')
    setTimeout(() => {
      createBot()
    }, 60000)
  })
}

createBot()





