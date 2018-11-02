/** @typedef {import('cypress')} */
const {given, when, then} = require('cypress-cucumber-preprocessor/resolveStepDefinition')

const url = 'https://www.google.com/?hl=en'

given('I open Google page', () => {
  cy.visit(url)
})
