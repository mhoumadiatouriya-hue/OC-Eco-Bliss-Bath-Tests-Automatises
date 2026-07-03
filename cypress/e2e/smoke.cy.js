describe('Smoke tests Eco Bliss Bath', () => {

  it('La page d’accueil se charge', () => {
    cy.visit('http://localhost:4200')
    cy.get('body').should('be.visible')
  })

  it('La page de connexion contient les champs et le bouton de connexion', () => {
    cy.visit('http://localhost:4200/#/login')

    cy.get('[data-cy="login-input-username"]').should('be.visible')
    cy.get('[data-cy="login-input-password"]').should('be.visible')
    cy.get('[data-cy="login-submit"]').should('be.visible')
  })

  it('La fiche produit contient le bouton panier et la disponibilité', () => {
    cy.visit('http://localhost:4200/#/products/3')

    cy.contains('Ajouter au panier').should('be.visible')
    cy.get('input[type="number"]').should('be.visible')
    cy.contains(/stock/i).should('be.visible')
  })

})