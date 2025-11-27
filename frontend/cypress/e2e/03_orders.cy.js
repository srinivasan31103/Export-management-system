describe('Orders Management Tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
    cy.visit('/orders');
  });

  it('should display orders list', () => {
    cy.contains('Orders').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('should filter orders by status', () => {
    cy.contains('Filter').click();
    cy.contains('Confirmed').click();
  });

  it('should search orders', () => {
    cy.get('input[placeholder*="Search"]').type('ORD');
    cy.wait(500);
  });

  it('should navigate to order details', () => {
    cy.get('table tbody tr').first().click();
    cy.url().should('include', '/orders/');
  });

  it('should display order details', () => {
    cy.visit('/orders');
    cy.get('table tbody tr a').first().click();
    cy.contains('Order Details').should('be.visible');
    cy.contains('Order Information').should('be.visible');
    cy.contains('Order Items').should('be.visible');
  });
});
