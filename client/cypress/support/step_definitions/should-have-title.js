/** @typedef {import('cypress')} */
const {given, when, then} = require('cypress-cucumber-preprocessor/resolveStepDefinition')

then('I see {string} in the title', title => {
    cy.title().should('include', title);
});