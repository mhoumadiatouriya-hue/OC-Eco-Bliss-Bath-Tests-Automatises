describe('Tests de sécurité XSS Eco Bliss Bath', () => {
  const frontUrl = 'http://localhost:4200'
  const apiUrl = 'http://localhost:8081'

  function login() {
    return cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: {
        username: 'test2@test.fr',
        password: 'testtest'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body.token
    })
  }

  it('Vérifie qu’un script injecté dans un avis ne s’exécute pas', () => {
    const xssPayload = '<script>alert("XSS")</script>'
    let alertTriggered = false

    cy.on('window:alert', () => {
      alertTriggered = true
    })

    cy.visit(frontUrl)

    cy.contains('Connexion').click()
    cy.get('[data-cy="login-input-username"]').type('test2@test.fr')
    cy.get('[data-cy="login-input-password"]').type('testtest')
    cy.get('[data-cy="login-submit"]').click({ force: true })

    cy.visit(`${frontUrl}/#/reviews`)

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

  it('Vérifie qu’une injection XSS dans la route d’ajout au panier est refusée', () => {
    const xssPayload = '<script>alert("XSS")</script>'

    login().then((token) => {
      cy.request(`${apiUrl}/products`).then((productsResponse) => {
        const product = productsResponse.body.find((item) => item.availableStock > 0)

        expect(product, 'Produit disponible').to.exist

        cy.request({
          method: 'PUT',
          url: `${apiUrl}/orders/add`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            product: product.id,
            quantity: xssPayload
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.not.eq(200)
        })
      })
    })
  })
})