describe('Application Routing', () => {
  it('redirects /chat to homepage', () => {
    cy.visit('/chat');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('redirects /chats to homepage', () => {
    cy.visit('/chats');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('shows 404 for unknown routes', () => {
    cy.visit('/unknown-route');
    cy.contains('Page not found').should('be.visible');
  });

  it('protects parent routes from unauthorized access', () => {
    cy.visit('/parents');
    // Should redirect to auth or show unauthorized message
    cy.url().should('not.include', '/parents');
  });
});