describe('Test fonctionnel - Produits', () => {

  it('Les produits sont affichés sur la page d’accueil', () => {

    cy.visit('http://localhost:8080')

    cy.contains('Notre sélection pour toi').should('be.visible')

    cy.get('article').should('have.length.at.least', 1)

    cy.contains('Consulter').should('be.visible')

  })

})