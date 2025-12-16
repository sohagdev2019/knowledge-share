import Hero from '@/app/(public)/_components/Hero';

describe('Hero Component', () => {
  it('renders correctly', () => {
    cy.mount(<Hero />);
    
    cy.contains('Learn at your pace').should('be.visible');
    cy.contains('master new skills').should('be.visible');
  });

  it('displays all text content', () => {
    cy.mount(<Hero />);
    
    cy.contains('An alternative to').should('be.visible');
    cy.contains('Access thousands of courses').should('be.visible');
    cy.contains('Build real-world projects').should('be.visible');
  });

  it('has correct links', () => {
    cy.mount(<Hero />);
    
    cy.contains('Start learning free')
      .should('have.attr', 'href', '/courses');
    
    cy.contains('Explore courses')
      .should('have.attr', 'href', '/courses');
  });

  it('applies correct styling classes', () => {
    cy.mount(<Hero />);
    
    cy.get('section').should('have.class', 'relative');
    cy.contains('Start learning free')
      .should('have.class', 'group');
  });
});
