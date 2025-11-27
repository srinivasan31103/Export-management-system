describe('Dashboard Tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
    cy.visit('/dashboard');
  });

  it('should display dashboard overview', () => {
    cy.contains('Dashboard Overview').should('be.visible');
  });

  it('should display KPI cards', () => {
    cy.contains('Total Revenue').should('be.visible');
    cy.contains('Total Orders').should('be.visible');
    cy.contains('Active Shipments').should('be.visible');
    cy.contains('Active Users').should('be.visible');
  });

  it('should display interactive charts', () => {
    cy.contains('Revenue Trend').should('be.visible');
    cy.contains('Order Volume').should('be.visible');
  });

  it('should have date range filters', () => {
    cy.contains('All Time').should('be.visible');
    cy.contains('Today').click();
    cy.contains('This Week').click();
    cy.contains('This Month').click();
  });

  it('should show notification center', () => {
    cy.get('[class*="Bell"]').parent().click();
    cy.contains('Notifications').should('be.visible');
  });

  it('should allow data export', () => {
    cy.contains('Export').click();
    cy.contains('Export to Excel').should('be.visible');
    cy.contains('Export to CSV').should('be.visible');
  });

  it('should refresh data', () => {
    cy.contains('Refresh').click();
    cy.contains('Dashboard refreshed successfully', { timeout: 10000 });
  });

  it('should display recent orders table', () => {
    cy.contains('Recent Orders').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('should search orders', () => {
    cy.get('input[placeholder*="Search"]').type('ORD');
    cy.wait(500);
  });
});
