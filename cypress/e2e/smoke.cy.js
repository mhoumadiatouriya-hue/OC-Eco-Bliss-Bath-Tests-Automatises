describe('Smoke tests Eco Bliss Bath', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('La page d’accueil se charge', () => {
    cy.get('body').should('be.visible')
  })

  it('Les éléments principaux sont visibles', () => {
    cy.contains('Accueil').should('be.visible')
    cy.contains('Produits').should('be.visible')
    cy.contains('Avis').should('be.visible')
    cy.contains('Connexion').should('be.visible')
    cy.contains('Inscription').should('be.visible')
  })
})