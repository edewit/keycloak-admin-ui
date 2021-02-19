/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Get one or more DOM elements by `data-testid`.
     *
     * @example
     * cy.getBy('searchButton')    // Gets the <button data-testid="searchButton">Search</button>
     */
    getBy(selector: string, ...args): Chainable<any>;
  }
}
