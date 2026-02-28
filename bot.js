const mineflayer = require('mineflayer')
const fs = require('fs')
const path = require('path')

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'WEBHOOK_BURAYA'
const logFile = path.join(__dirname, 'chat_logs.txt')

function createBot() {

  const bot = mineflayer.createBot({
    host: 'zurnacraft.net',
    port: 25565,
    username: 'Fevri03',
    version: '1.21.4', // SABİTLEDİK
    auth: 'offline',
    hideErrors: false
  })

  function logChat(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}\n`
    fs.appendFile(logFile, logMessage, () => {})
    console.log(logMessage.trim())
  }

  bot.on('login', () => {
    console.log('Login packet alındı')
  })

  bot.once('spawn', async () => {
    logChat('Bot spawn oldu')

    // SUNUCU TAM YÜKLENSİN DİYE BEKLE
    await bot.waitForTicks(100) // ~5 saniye

    try {
      bot.chat('/login benbitben')
      logChat('Login komutu gönderildi')
    } catch (e) {
      logChat('Login hatası: ' + e.message)
      return
    }

    // LOGIN SONRASI EKSTRA BEKLE
    await bot.waitForTicks(120)

    if (!bot.entity) return

    try {
      bot.setQuickBarSlot(4)
      await bot.waitForTicks(60)

      bot.activateItem()
      logChat('5. slot sağ tık')

      await bot.waitForTicks(100)

      const window = bot.currentWindow
      if (window && window.slots.length > 23) {
        await bot.clickWindow(23, 0, 0)
        logChat('24. slot tıklandı')
        await bot.waitForTicks(60)
        bot.closeWindow(window)
      }

      await bot.waitForTicks(60)
      bot.chat('/home 1')
      logChat('/home 1 gönderildi')

    } catch (e) {
      logChat('GUI işlem hatası: ' + e.message)
    }
  })

  bot.on('message', (message) => {
    logChat('CHAT: ' + message.toString())
  })

  bot.on('kicked', (reason) => {
    console.log('KICK DETAY:', reason)
    try {
      logChat('Kick reason: ' + JSON.stringify(reason))
    } catch {
      logChat('Kick reason: ' + String(reason))
    }
  })

  bot.on('error', (err) => {
    console.log('BOT ERROR:', err)
    logChat('Error: ' + err.message)
  })

  bot.on('end', () => {
    logChat('Bağlantı kesildi. 5 saniye sonra yeniden bağlanılıyor...')
    setTimeout(() => {
      createBot()
    }, 5000)
  })

  return bot
}

createBot()
