const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Путь к тестам
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Папка с результатами
    supportFile: false,

    // Можно указать базовый URL
    // baseUrl: 'https://tvoi-sait.ru',

    setupNodeEvents(on, config) {
      // Подавляем вывод DevTools сообщений
      on('task', {
        log(message) {
          if (!message.includes('DevTools listening')) {
            console.log(message)
          }
          return null
        }
      })
    }
  },
  
  // Подавляем лишние логи
  video: false,
  screenshotOnRunFailure: true,
})