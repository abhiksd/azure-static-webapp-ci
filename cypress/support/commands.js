// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to check if element contains text
Cypress.Commands.add('containsText', (selector, text) => {
  cy.get(selector).should('contain.text', text)
})

// Custom command to navigate to a page
Cypress.Commands.add('navigateTo', (page) => {
  cy.get('nav').contains(page).click()
})

// Custom command to check page load
Cypress.Commands.add('checkPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.get('header').should('be.visible')
  cy.get('footer').should('be.visible')
})

// Custom command to fill contact form
Cypress.Commands.add('fillContactForm', (name, email, message) => {
  cy.get('#name').type(name)
  cy.get('#email').type(email)
  cy.get('#message').type(message)
})