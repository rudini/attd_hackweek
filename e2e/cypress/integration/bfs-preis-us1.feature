Feature: Als Privatperson möchte ich für einen gewissen Zeitraum die Teuerung berechnen können, sodass ich weiss wieviel ich für Lohnzahlungen künftig zahlen muss.

    Scenario: Lohnteuerung
        Given sei der Teuerungsrechner
        When ich ein Lohn von 70000.00 CHF
        And ein Startdatum im "Januar 2016"
        And ein Zieldatum im "Januar 2017"
        And eine Teuerung für die Index-Basis: "Dezember 2015" eingebe 
        And die Teuerung berechne
        Then wird ein Betrag von 70281.00 CHF
        And eine Veränderung von 0.4 % angezeigt

    Scenario: Lohnteuerung Zwischenwerte
        Given sei der Teuerungsrechner
        When ich ein Lohn von 70000.00 CHF
        And ein Startdatum im "Januar 2016"
        And ein Zieldatum im "Januar 2017"
        And eine Teuerung für die Index-Basis: "Dezember 2015" eingebe
        And die Teuerung berechne
        Then werden folgende Indexe aufgelistet
            | Januar 2016 | Februar 2016 | März 2016 | April 2016 | May 2016 | Juni 2016 | July 2016 | August 2016 | September 2016 | Oktober 2016 | November 2016 | Dezember 2016 | Januar 2017 |
            | 99.6        | 99.8         | 100.1     | 100.4      | 100.6    | 100.7     | 100.3     | 100.2       | 100.2          | 100.3        | 100.1         | 100.0         | 100.0       |
