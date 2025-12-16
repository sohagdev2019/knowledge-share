/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mount a React component
     * @example cy.mount(<MyComponent />)
     */
    mount(component: React.ReactNode): Chainable<void>;
  }
}
