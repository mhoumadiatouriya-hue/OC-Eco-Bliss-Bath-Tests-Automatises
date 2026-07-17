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
      expect(response.body).to.have.property('token')

      return response.body.token
    })
  }

  it('Vérifie qu’un script injecté dans un avis ne s’exécute pas', () => {
    const xssPayload = '<script>alert("XSS")</script>'
    const reviewTitle = `Test XSS ${Date.now()}`
    let alertTriggered = false

    cy.on('window:alert', () => {
      alertTriggered = true
    })

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

    cy.window().should((window) => {
      expect(window.localStorage.getItem('user')).to.exist
    })

    cy.visit(`${frontUrl}/#/reviews`)

    cy.get('[data-cy="review-form"]', { timeout: 10000 })
      .should('be.visible')

    cy.get('[data-cy="review-input-rating-images"] img')
      .should('have.length', 5)
      .eq(4)
      .click()

    cy.get('[data-cy="review-input-title"]')
      .type(reviewTitle)

    cy.get('[data-cy="review-input-comment"]')
      .type(xssPayload, {
        parseSpecialCharSequences: false
      })

    cy.get('[data-cy="review-submit"]')
      .click({ force: true })

    cy.contains('[data-cy="review-title"]', reviewTitle, {
      timeout: 10000
    })
      .should('be.visible')
      .parents('[data-cy="review-detail"]')
      .within(() => {
        cy.get('[data-cy="review-comment"]')
          .find('script')
          .should('not.exist')

        cy.get('[data-cy="review-comment"]')
          .invoke('html')
          .should('not.include', '<script')
      })

    cy.then(() => {
      expect(alertTriggered).to.eq(false)
    })
  })

  it('Vérifie qu’une injection XSS dans la route d’ajout au panier est refusée', () => {
    const xssPayload = '<script>alert("XSS")</script>'

    login().then((token) => {
      cy.request(`${apiUrl}/products`).then((productsResponse) => {
        expect(productsResponse.status).to.eq(200)
        expect(productsResponse.body).to.be.an('array')
        expect(productsResponse.body.length).to.be.greaterThan(0)

        const product = productsResponse.body[0]

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