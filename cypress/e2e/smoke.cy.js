describe('Smoke test Eco Bliss Bath', () => {
  const frontUrl = 'http://localhost:4200'

  it('La page d’accueil se charge et affiche ses éléments principaux', () => {
    cy.visit(frontUrl)

    cy.get('body').should('be.visible')

    cy.contains(/eco\.?bliss\.?bath/i)
      .should('be.visible')

    cy.contains(/voir les produits/i)
      .should('be.visible')
  })
})