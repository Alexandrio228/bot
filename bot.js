const { Telegraf } = require('telegraf')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Токен и ID (оставь свои)
const BOT_TOKEN = '8416750673:AAGWz-u1eGxfitJJALzt8kghKjyQMaycDXM'
const CHAT_ID = '7777784485'

const bot = new Telegraf(BOT_TOKEN)

// Путь к результату
const resultPath = path.join(__dirname, 'cypress', 'results', 'form-result.json')

// Команда /start
bot.start((ctx) => {
  ctx.reply('Привет! Я бот, который проверяет форму на <a href="https://avrora-rnd.ru">Avrora-RnD</a>\nНапиши /check, чтобы проверить.', { parse_mode: 'HTML' })
})

// Команда /check — ручная проверка
bot.command('check', (ctx) => {
  ctx.reply('🚀 Запускаю проверку формы...')
  runCypressTest()
})

function runCypressTest() {
  console.log('✅ Запуск проверки формы на Avrora-RnD')

  exec('npx cypress run --spec cypress/e2e/check-form.cy.js', (error, stdout, stderr) => {
    let report = ''

    if (error) {
      console.error('Ошибка запуска Cypress:', error)
      report = `🔴 <b>Ошибка запуска</b>\n<pre>${stderr || error.message}</pre>`
    } else {
      if (fs.existsSync(resultPath)) {
        const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'))
        if (result.success) {
          // Форматируем дату: например, 22.11.2025, 9:00
          const date = new Date(result.timestamp)
          const formattedDate = date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\s+/g, ' ').trim()

          report = `🟢 <b>Форма отправлена успешно</b>\n<b>Статус:</b> На данный момент заявки отправляются успешно\n<b>Время:</b> ${formattedDate}`
        } else {
          // Ошибка отправки — тоже форматируем дату
          const date = new Date(result.timestamp)
          const formattedDate = date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\s+/g, ' ').trim()

          report = `🔴 <b>Форма не отправлена</b>\n<b>Сообщение:</b> ${result.message}\n<b>Статус:</b> ${result.status}\n<b>Время:</b> ${formattedDate}`
        }
      } else {
        // Файл с результатом не создан
        report = `🟡 <b>Результат не найден</b> — возможно, тест упал до записи`
      }
    }

    // Отправляем в Telegram с HTML-разметкой
    bot.telegram.sendMessage(CHAT_ID, report, { parse_mode: 'HTML' })
      .catch(err => console.error('Не удалось отправить в Telegram:', err))
  })
}

// Ежедневная проверка в 9:00
require('node-cron').schedule('0 9 * * *', () => {
  console.log('⏰ Ежедневная проверка формы...')
  runCypressTest()
})

// Запуск бота
bot.launch()
console.log('🤖 Бот запущен. Напиши ему в Telegram команду /check')