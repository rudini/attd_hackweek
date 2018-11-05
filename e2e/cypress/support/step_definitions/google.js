/// <reference types="cypress"/>
/// <reference types="cucumber"/>

const url = 'https://www.google.com/?hl=en';

// given is the same as beforeEach in traditional unit tests.
Given('A Google page', () => {
    cy.cleanDatabase();
    cy.visit(url);
});

When('I open Google page', () => {
    cy.visit(url);
});

When('I search for {string}', searchstring => {
    cy.get('#lst-ib').type(searchstring);
    cy.get(':nth-child(1) > .lsbb > .lsb').click();
});

// Example for table data
// https://stackoverflow.com/questions/40871977/cucumberjs-data-tables-how-to-turn-it-to-raw
