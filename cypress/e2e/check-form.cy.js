describe('Проверка формы на Avrora-RnD', () => {
  it('Открывает попап, заполняет и отправляет форму', () => {
    // Заходим на сайт
    cy.visit('https://avrora-rnd.ru', { timeout: 30000 })

    // Ждём загрузки и кликаем "Подробнее"
    cy.get('button[data-src="#popup-book"]', { timeout: 10000 }).first().click({ force: true })

    // Ждём, пока попап откроется
    cy.get('#popup-book', { timeout: 5000 }).should('be.visible')

    // ЗАПОЛНЯЕМ ПОЛЯ — только внутри открытого попапа
    cy.get('#popup-book').within(() => {
      // Уникальные селекторы по placeholder
      cy.get('input[placeholder="Имя"]')
        .clear({ force: true })
        .type('Тестовое имя', { force: true })

      cy.get('input[placeholder="+7 (___) ___-__-__"]')
        .clear({ force: true })
        .type('+79111234567', { force: true })

      // Отмечаем чекбокс
      cy.get('input[type="checkbox"][required]')
        .check({ force: true })
    })

    // Перехватываем POST-запрос
    cy.intercept('POST', '**/ajax.php*').as('submitForm')

    // Кликаем кнопку отправки
    cy.get('.popup__btn').contains('Получить предложение').click({ force: true })

    // Ждём ответ
    cy.wait('@submitForm', { timeout: 20000 }).then((interception) => {
      const status = interception.response?.statusCode
      const body = interception.response?.body
      // Определяем успех
      const success = status === 200

      // Сохраняем результат
      cy.writeFile('cypress/results/form-result.json', {
        success,
        status,
        message: success ? 'Форма успешно отправлена' : `Ошибка: ${status}`,
        timestamp: new Date().toISOString()
      })
    })
  })
})