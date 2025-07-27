describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows auth page when not logged in', () => {
    cy.contains('Sign In').should('be.visible');
  });

  it('allows parent login', () => {
    cy.loginAsParent();
    cy.visit('/');
    // Should show main interface
    cy.get('[data-testid="chat-interface"]').should('be.visible');
  });

  it('allows child login', () => {
    cy.loginAsChild();
    cy.visit('/');
    // Should show main interface
    cy.get('[data-testid="chat-interface"]').should('be.visible');
  });

  it('redirects child from parent dashboard', () => {
    cy.loginAsChild();
    cy.visit('/parents');
    cy.url().should('not.include', '/parents');
  });
});