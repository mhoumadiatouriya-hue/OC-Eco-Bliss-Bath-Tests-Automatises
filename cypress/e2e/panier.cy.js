describe('Tests fonctionnels - Panier', () => {
  const frontUrl = 'http://localhost:4200'
  const apiUrl = 'http://localhost:8081'

  function login() {
    cy.visit(`${frontUrl}/#/login`)

    cy.get('[data-cy="login-input-username"]')
      .should('be.visible')
      .type('test2@test.fr')

    cy.get('[data-cy="login-input-password"]')
      .should('be.visible')
      .type('testtest')

    cy.get('[data-cy="login-submit"]')
      .should('be.visible')
      .click({ force: true })
  }

  beforeEach(() => {
    cy.intercept('POST', `${apiUrl}/login`).as('loginRequest')
    cy.intercept('PUT', `${apiUrl}/orders/add`).as('addToCart')

    login()

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200)
  })

  it('Un utilisateur connecté peut ajouter un produit disponible au panier', function () {
    cy.request(`${apiUrl}/products`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')

      const product = response.body.find(
        (item) => item.availableStock > 0
      )

      if (!product) {
        cy.log('Aucun produit avec un stock positif dans le jeu de données')
        this.skip()
      }

      cy.visit(`${frontUrl}/#/products/${product.id}`)

      cy.get('input[type="number"]')
        .clear()
        .type('1')

      cy.contains('Ajouter au panier')
        .click({ force: true })

      cy.wait('@addToCart').then((interception) => {
        expect(interception.response.statusCode).to.eq(200)
      })
    })
  })

  it('Un utilisateur ne doit pas pouvoir ajouter une quantité supérieure au stock disponible', function () {
    cy.request(`${apiUrl}/products`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')

      const product = response.body.find(
        (item) => item.availableStock > 0
      )

      if (!product) {
        cy.log('Aucun produit avec un stock positif dans le jeu de données')
        this.skip()
      }

      cy.visit(`${frontUrl}/#/products/${product.id}`)

      cy.get('input[type="number"]')
        .clear()
        .type(String(product.availableStock + 1))

      cy.contains('Ajouter au panier')
        .click({ force: true })

      cy.wait('@addToCart').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200)
      })
    })
  })

  it('Un produit indisponible ne doit pas pouvoir être ajouté au panier', () => {
    cy.request(`${apiUrl}/products`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')

      const product = response.body.find(
        (item) => item.availableStock <= 0
      )

      expect(product, 'Produit avec un stock nul ou négatif').to.exist

      cy.visit(`${frontUrl}/#/products/${product.id}`)

      cy.get('input[type="number"]')
        .clear()
        .type('1')

      cy.contains('Ajouter au panier')
        .click({ force: true })

      cy.wait('@addToCart').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200)
      })
    })
  })

  it('Un utilisateur ne doit pas pouvoir ajouter une quantité négative', function () {
    cy.request(`${apiUrl}/products`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')

      const product = response.body.find(
        (item) => item.availableStock > 0
      )

      if (!product) {
        cy.log('Aucun produit disponible pour isoler le contrôle de la quantité négative')
        this.skip()
      }

      cy.visit(`${frontUrl}/#/products/${product.id}`)

      cy.get('input[type="number"]')
        .clear()
        .type('-1')

      cy.contains('Ajouter au panier')
        .click({ force: true })

      cy.wait('@addToCart').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200)
      })
    })
  })
})