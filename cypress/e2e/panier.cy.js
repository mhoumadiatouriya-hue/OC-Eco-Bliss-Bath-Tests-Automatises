describe('Test fonctionnel - Panier', () => {
  const frontUrl = 'http://localhost:4200'
  const apiUrl = 'http://localhost:8081'

  function login() {
    cy.visit(`${frontUrl}/#/login`)

    cy.get('[data-cy="login-input-username"]').type('test2@test.fr')
    cy.get('[data-cy="login-input-password"]').type('testtest')
    cy.get('[data-cy="login-submit"]').click({ force: true })
  }

  beforeEach(() => {
    cy.intercept('POST', `${apiUrl}/login`).as('loginRequest')
    cy.intercept('PUT', `${apiUrl}/orders/add`).as('addToCart')

    login()

    cy.wait('@loginRequest')
  })

  it('Un utilisateur connecté peut ajouter un produit disponible au panier', () => {
    cy.request(`${apiUrl}/products`).then((response) => {
      const product = response.body.find((item) => item.availableStock > 1)

      expect(product, 'Produit avec stock disponible').to.exist

      cy.visit(`${frontUrl}/#/products/${product.id}`)

      cy.contains('Ajouter au panier').should('be.visible')
      cy.get('input[type="number"]').clear().type('1')
      cy.contains('Ajouter au panier').click({ force: true })

      cy.wait('@addToCart').then((interception) => {
        expect(interception.response.statusCode).to.eq(200)
      })
    })
  })

  it('Un utilisateur ne doit pas pouvoir ajouter une quantité supérieure au stock disponible', () => {
    cy.request(`${apiUrl}/products`).then((response) => {
      const product = response.body.find((item) => item.availableStock > 0)

      expect(product, 'Produit avec stock disponible').to.exist

      cy.visit(`${frontUrl}/#/products/${product.id}`)

      cy.get('input[type="number"]').clear().type(product.availableStock + 1)
      cy.contains('Ajouter au panier').click({ force: true })

      cy.wait('@addToCart').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200)
      })
    })
  })
})

it('Un produit avec un stock négatif ne doit pas pouvoir être ajouté au panier', () => {
  cy.request(`${apiUrl}/products`).then((response) => {
    const product = response.body.find((item) => item.availableStock < 0)

    expect(product, 'Produit avec stock négatif').to.exist

    cy.visit(`${frontUrl}/#/products/${product.id}`)

    cy.contains('Ajouter au panier').click({ force: true })

    cy.wait('@addToCart').then((interception) => {
      expect(interception.response.statusCode).to.not.eq(200)
    })
  })
})