describe('Test fonctionnel - Connexion', () => {
  it('Un utilisateur connu peut se connecter', () => {
    cy.intercept('POST', 'http://localhost:8081/login').as('loginRequest')

    cy.visit('http://localhost:8080')

    cy.contains('Connexion').click()

    cy.get('[data-cy="login-input-username"]').type('test2@test.fr')
    cy.get('[data-cy="login-input-password"]').type('testtest')

    cy.get('[data-cy="login-submit"]').click({ force: true })

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200)
      expect(interception.response.body).to.have.property('token')
    })

    cy.window().then((window) => {
      expect(window.localStorage.getItem('user')).to.exist
    })
  })
})