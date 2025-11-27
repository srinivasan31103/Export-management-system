describe('Shipments Management Tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
    cy.visit('/shipments');
  });

  it('should display shipments list', () => {
    cy.contains('Shipments').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('should filter shipments by status', () => {
    cy.contains('All').should('be.visible');
  });

  it('should search shipments', () => {
    cy.get('input[placeholder*="Search"]').type('SHP');
    cy.wait(500);
  });

  it('should display shipment details', () => {
    cy.get('table tbody tr a').first().click();
    cy.contains('Shipment Details').should('be.visible');
  });

  it('should create new shipment', () => {
    cy.contains('Create Shipment').click();
    cy.url().should('include', '/shipments/create');
  });
});
