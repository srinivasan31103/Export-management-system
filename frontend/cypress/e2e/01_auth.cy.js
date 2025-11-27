describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login successfully with admin credentials', () => {
    cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
    cy.url().should('include', '/dashboard');
  });

  it('should login with clerk credentials', () => {
    cy.login(Cypress.env('clerkEmail'), Cypress.env('clerkPassword'));
    cy.url().should('include', '/dashboard');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@test.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
