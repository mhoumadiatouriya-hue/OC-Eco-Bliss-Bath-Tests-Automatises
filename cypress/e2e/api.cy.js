describe('Tests API Eco Bliss Bath', () => {

  it('GET /products retourne la liste des produits', () => {

    cy.request('http://localhost:8081/products')
      .then((response) => {

        expect(response.status).to.eq(200)
        expect(response.body).to.exist
        expect(response.body.length).to.be.greaterThan(0)

        expect(response.body[0]).to.have.property('id')
        expect(response.body[0]).to.have.property('name')
        expect(response.body[0]).to.have.property('price')

      })

  })

  it('GET /products/3 retourne une fiche produit', () => {

    cy.request('http://localhost:8081/products/3')
      .then((response) => {

        expect(response.status).to.eq(200)

        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('name')
        expect(response.body).to.have.property('price')
        expect(response.body).to.have.property('availableStock')

      })

  })

  it('GET /orders sans authentification retourne une erreur', () => {

    cy.request({
      method: 'GET',
      url: 'http://localhost:8081/orders',
      failOnStatusCode: false
    }).then((response) => {

      expect([401, 403]).to.include(response.status)

    })

  })

})