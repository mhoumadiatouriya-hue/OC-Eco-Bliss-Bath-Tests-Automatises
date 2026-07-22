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
      .click()
  }

  beforeEach(() => {
    cy.intercept('POST', `${apiUrl}/login`).as('loginRequest')

    login()

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 200)
  })

  it(
    'Un utilisateur ne doit pas pouvoir ajouter une quantité supérieure au stock disponible',
    function () {
      cy.request(`${apiUrl}/products`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')

        const product = response.body.find(
          (item) => item.availableStock > 0
        )

        if (!product) {
          cy.log(
            'Aucun produit avec un stock positif dans le jeu de données'
          )
          this.skip()
        }

        cy.intercept(
          'PUT',
          `${apiUrl}/orders/add`
        ).as('addToCart')

        cy.visit(`${frontUrl}/#/products/${product.id}`)

        cy.get('input[type="number"]')
          .should('be.visible')
          .clear()
          .type(String(product.availableStock + 1))

        cy.contains('Ajouter au panier')
          .should('be.visible')
          .click()

        cy.wait('@addToCart').then((interception) => {
          expect(
            interception.response.statusCode,
            'Une quantité supérieure au stock doit être refusée'
          ).to.not.eq(200)
        })
      })
    }
  )

  it(
    'Un produit indisponible ne doit pas pouvoir être ajouté au panier',
    () => {
      cy.request(`${apiUrl}/products`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')

        const product = response.body.find(
          (item) => item.availableStock <= 0
        )

        expect(
          product,
          'Produit avec un stock nul ou négatif'
        ).to.exist

        cy.intercept(
          'PUT',
          `${apiUrl}/orders/add`
        ).as('addToCart')

        cy.visit(`${frontUrl}/#/products/${product.id}`)

        cy.get('input[type="number"]')
          .should('be.visible')
          .clear()
          .type('1')

        cy.contains('Ajouter au panier')
          .should('be.visible')
          .click()

        cy.wait('@addToCart').then((interception) => {
          expect(
            interception.response.statusCode,
            'L’ajout d’un produit indisponible doit être refusé'
          ).to.not.eq(200)
        })
      })
    }
  )
})