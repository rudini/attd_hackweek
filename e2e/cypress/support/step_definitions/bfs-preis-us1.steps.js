/// <reference types="cypress"/>
/// <reference types="cucumber"/>

Given('sei der Teuerungsrechner', () => {
    cy.cleanDatabase();
    cy.visit('/');
});

When('ich ein Lohn von {float} CHF', lohn => {
    cy.get('[data-test="betrag"]').type(lohn);
});

When('ein Startdatum im {string}', startdatum => {
    cy.get('[data-test="startdatum"]').type(startdatum);
});

When('ein Zieldatum im {string}', zieldatum => {
    cy.get('[data-test="zieldatum"]').type(zieldatum);
});

When('eine Teuerung für die Index-Basis: {string} eingebe', indexbasis => {
    cy.get('[data-test="indexbasis"]').type(indexbasis);
});

When('die Teuerung berechne', _ => {
    cy.get('[data-test="berechnen"]').click();
});

Then('wird ein Betrag von {string} CHF', betrag => {
    cy.get('[data-test="zielbetrag"]').invoke('text').should(value => expect(value).to.contain(betrag));
});

Then('eine Veränderung von {float} % angezeigt', veraenderung => {
    cy.get('[data-test="veraenderung"]').invoke('text').should(value => expect(value).to.contain(veraenderung));
});

Then('werden folgende Indexe aufgelistet', werte => {
    const getValuesBySelector = (selector) => {
        let values = [];
        return cy.get(selector).each((element) => values.push(element.get(0).innerHTML)).then(() => values);
    };
    const expected = werte.raw();

    // Assert
    getValuesBySelector('[data-test="index-header"]').then(headers => expect(headers).eqls(expected[0]));
    getValuesBySelector('[data-test="index-value"]').then(values => expect(values).eqls(expected[1]));
});
