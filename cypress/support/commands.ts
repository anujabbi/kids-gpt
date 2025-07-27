// Custom commands for Cypress testing

Cypress.Commands.add('loginAsParent', () => {
  // Mock login as parent user
  cy.window().then((win) => {
    win.localStorage.setItem('sb-puuzmlhoepqotgzlpdho-auth-token', JSON.stringify({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-parent-id',
        email: 'parent@test.com',
        role: 'parent'
      }
    }));
  });
});

Cypress.Commands.add('loginAsChild', () => {
  // Mock login as child user
  cy.window().then((win) => {
    win.localStorage.setItem('sb-puuzmlhoepqotgzlpdho-auth-token', JSON.stringify({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-child-id',
        email: 'child@test.com',
        role: 'child'
      }
    }));
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsParent(): Chainable<void>;
      loginAsChild(): Chainable<void>;
    }
  }
}