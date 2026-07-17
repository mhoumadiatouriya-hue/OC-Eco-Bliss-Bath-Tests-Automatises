describe('Tests API Eco Bliss Bath', () => {
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

  it('GET /products retourne la liste des produits', () => {
    cy.request(`${apiUrl}/products`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.be.greaterThan(0)

      expect(response.body[0]).to.have.property('id')
      expect(response.body[0]).to.have.property('name')
      expect(response.body[0]).to.have.property('price')
      expect(response.body[0]).to.have.property('availableStock')
    })
  })

  it('GET /products/{id} retourne une fiche produit', () => {
    cy.request(`${apiUrl}/products`).then((productsResponse) => {
      expect(productsResponse.status).to.eq(200)
      expect(productsResponse.body).to.be.an('array')
      expect(productsResponse.body.length).to.be.greaterThan(0)

      const product = productsResponse.body[0]

      cy.request(`${apiUrl}/products/${product.id}`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('id', product.id)
        expect(response.body).to.have.property('name')
        expect(response.body).to.have.property('price')
        expect(response.body).to.have.property('availableStock')
      })
    })
  })

  it('GET /orders sans authentification doit retourner une erreur 403', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/orders`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(403)
    })
  })

  it('GET /orders retourne le panier pour un utilisateur connecté', () => {
    login().then((token) => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/orders`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.exist
      })
    })
  })

  it('PUT /orders/add ajoute un produit disponible au panier', function () {
    login().then((token) => {
      cy.request(`${apiUrl}/products`).then((productsResponse) => {
        expect(productsResponse.status).to.eq(200)
        expect(productsResponse.body).to.be.an('array')

        const availableProduct = productsResponse.body.find(
          (product) => product.availableStock > 0
        )

        if (!availableProduct) {
          cy.log('Aucun produit avec un stock positif dans le jeu de données')
          this.skip()
        }

        cy.request({
          method: 'PUT',
          url: `${apiUrl}/orders/add`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            product: availableProduct.id,
            quantity: 1
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })

  it('PUT /orders/add refuse un produit en rupture de stock', () => {
    login().then((token) => {
      cy.request(`${apiUrl}/products`).then((productsResponse) => {
        expect(productsResponse.status).to.eq(200)
        expect(productsResponse.body).to.be.an('array')

        const unavailableProduct = productsResponse.body.find(
          (product) => product.availableStock <= 0
        )

        expect(
          unavailableProduct,
          'Produit en rupture ou indisponible'
        ).to.exist

        cy.request({
          method: 'PUT',
          url: `${apiUrl}/orders/add`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            product: unavailableProduct.id,
            quantity: 1
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.not.eq(200)
        })
      })
    })
  })
})