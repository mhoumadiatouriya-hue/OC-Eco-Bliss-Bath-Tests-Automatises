describe('Test fonctionnel - Panier', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:8081/login').as('loginRequest')
    cy.intercept('PUT', 'http://localhost:8081/orders/add').as('addToCart')

    cy.visit('http://localhost:8080')

    cy.contains('Connexion').click()

    cy.get('[data-cy="login-input-username"]').type('test2@test.fr')
    cy.get('[data-cy="login-input-password"]').type('testtest')

    cy.get('[data-cy="login-submit"]').click({ force: true })

    cy.wait('@loginRequest')
  })

  it('Un utilisateur connecté peut ajouter un produit disponible au panier', () => {
    cy.request('http://localhost:8081/products').then((response) => {
      const product = response.body.find((item) => item.availableStock > 1)

      expect(product, 'Produit avec stock disponible').to.exist

      cy.visit(`http://localhost:8080/#/products/${product.id}`)

      cy.contains('Ajouter au panier').should('be.visible')
      cy.get('input[type="number"]').clear().type('1')

      cy.contains('Ajouter au panier').click({ force: true })

      cy.wait('@addToCart').then((interception) => {
        expect(interception.response.statusCode).to.eq(200)
      })
    })
  })
})