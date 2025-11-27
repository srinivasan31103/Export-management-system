// ***********************************************
// Custom commands for Export Management System
// ***********************************************

/**
 * Login command - authenticates a user via UI
 * Usage: cy.login('admin@export.com', 'clerk123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();

  // Wait for authentication to complete
  cy.url().should('not.include', '/login');
  cy.window().its('localStorage.token').should('exist');
});

/**
 * Login via API - faster for setup
 * Usage: cy.loginViaAPI()
 */
Cypress.Commands.add('loginViaAPI', (email = Cypress.env('adminEmail'), password = Cypress.env('adminPassword')) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('token');

    // Store auth token in localStorage
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

/**
 * Logout command
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
  cy.visit('/login');
});

/**
 * Check if element is visible after loading
 * Usage: cy.get('.element').shouldBeVisibleAfterLoading()
 */
Cypress.Commands.add('shouldBeVisibleAfterLoading', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

/**
 * Wait for API call to complete
 * Usage: cy.waitForAPI('@getOrders')
 */
Cypress.Commands.add('waitForAPI', (alias) => {
  cy.wait(alias).its('response.statusCode').should('eq', 200);
});

/**
 * Create order via API
 * Usage: cy.createOrder(orderData)
 */
Cypress.Commands.add('createOrder', (orderData) => {
  cy.window().then((win) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/orders`,
      headers: {
        'Authorization': `Bearer ${win.localStorage.getItem('token')}`
      },
      body: orderData
    }).then((response) => {
      expect(response.status).to.eq(201);
      return cy.wrap(response.body.data);
    });
  });
});

/**
 * Create shipment via API
 * Usage: cy.createShipment(shipmentData)
 */
Cypress.Commands.add('createShipment', (shipmentData) => {
  cy.window().then((win) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/shipments`,
      headers: {
        'Authorization': `Bearer ${win.localStorage.getItem('token')}`
      },
      body: shipmentData
    }).then((response) => {
      expect(response.status).to.eq(201);
      return cy.wrap(response.body.data);
    });
  });
});

/**
 * Clean up test data
 * Usage: cy.cleanupTestData()
 */
Cypress.Commands.add('cleanupTestData', () => {
  // This would call a test endpoint to clean up test data
  // For now, just a placeholder
  cy.log('Cleaning up test data...');
});