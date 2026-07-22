describe('Test fonctionnel - Connexion', () => {
  const frontUrl = 'http://localhost:4200'
  const apiUrl = 'http://localhost:8081'

  it('Un utilisateur connu peut se connecter', () => {
    cy.intercept('POST', `${apiUrl}/login`).as('loginRequest')

    cy.visit(frontUrl)

    cy.contains('Connexion').click()

    cy.get('[data-cy="login-input-username"]')
      .should('be.visible')
      .type('test2@test.fr')

    cy.get('[data-cy="login-input-password"]')
      .should('be.visible')
      .type('testtest')

    cy.get('[data-cy="login-submit"]').click()

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200)
      expect(interception.response.body).to.have.property('token')
    })

    cy.window().then((window) => {
      expect(window.localStorage.getItem('user')).to.exist
    })

    cy.url().should('not.include', '/login')
  })
})