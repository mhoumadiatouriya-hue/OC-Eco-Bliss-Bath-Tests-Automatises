describe('Tests de sécurité XSS Eco Bliss Bath', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:8081/login').as('loginRequest')

    cy.visit('http://localhost:8080')

    cy.contains('Connexion').click()

    cy.get('[data-cy="login-input-username"]').type('test2@test.fr')
    cy.get('[data-cy="login-input-password"]').type('testtest')

    cy.get('[data-cy="login-submit"]').click({ force: true })

    cy.wait('@loginRequest')
  })

  it('Vérifie qu’un script injecté dans un avis ne s’exécute pas', () => {
    const xssPayload = '<script>alert("XSS")</script>'

    let alertTriggered = false

    cy.on('window:alert', () => {
      alertTriggered = true
    })

    cy.visit('http://localhost:8080/#/reviews')

    cy.get('[data-cy="review-input-rating-images"] img').eq(4).click()
    cy.get('[data-cy="review-input-title"]').type('Test XSS')
    cy.get('[data-cy="review-input-comment"]').type(xssPayload, {
      parseSpecialCharSequences: false
    })

    cy.get('[data-cy="review-submit"]').click({ force: true })

    cy.wrap(null).then(() => {
      expect(alertTriggered).to.eq(false)
    })
  })
})