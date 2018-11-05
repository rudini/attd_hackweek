/// <reference types="cypress"/>
/// <reference types="cucumber"/>

Given('sei der Teuerungsrechner', () => {
    cy.cleanDatabase();
    cy.visit('/lik_rechner');
});

When('ich ein Lohn von {float} CHF', lohn => {
    cy.get('[data-e2e="lohn"]').type(lohn);
});

When('ein Startdatum im {string}', startdatum => {
    cy.get('[data-e2e="startdatum"]').type(startdatum);
});

When('ein Zieldatum im {string}', zieldatum => {
    cy.get('[data-e2e="zieldatum"]').type(zieldatum);
});

When('eine Teuerung für die Index-Basis: {string} eingebe', indexbasis => {
    cy.get('[data-e2e="indexbasis"]').type(indexbasis);
});

When('die Teuerung berechne', _ => {
    cy.get('[data-e2e="berechnen"]').click();
});

Then('wird ein Betrag von {float} CHF', betrag => {
    cy.get('[data-e2e="zielbetrag"]').should('match', betrag);
});

Then('eine Veränderung von {float} % angezeigt', veraenderung => {
    cy.get('[data-e2e="veraenderung"]').should('match', veraenderung);
});

Then('werden folgende Indexe aufgelistet', werte => {
    throw Error('not yet implemented');
});
