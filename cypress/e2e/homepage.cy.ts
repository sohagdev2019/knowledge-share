describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the homepage successfully', () => {
    cy.url().should('include', '/');
    cy.get('body').should('be.visible');
  });

  it('should display hero section with main headline', () => {
    cy.contains('Learn at your pace').should('be.visible');
    cy.contains('master new skills').should('be.visible');
  });

  it('should display description text', () => {
    cy.contains('Access thousands of courses taught by industry experts').should(
      'be.visible'
    );
  });

  it('should have working CTA buttons', () => {
    cy.contains('Start learning free').should('be.visible');
    cy.contains('Explore courses').should('be.visible');
    
    // Test navigation
    cy.contains('Start learning free').click();
    cy.url().should('include', '/courses');
  });

  it('should be responsive on mobile viewport', () => {
    cy.viewport(375, 667);
    cy.contains('Learn at your pace').should('be.visible');
  });
});
