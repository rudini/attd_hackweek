Feature: Als Privatperson möchte ich für einen gewissen Zeitraum die Teuerung berechnen können, sodass ich weiss wieviel ich für Lohnzahlungen künftig zahlen muss.

    Scenario: Lohnteuerung
        Given ein Lohn von "70000.00" CHF
        And ein Startdatum im "Januar 2016"
        And ein Zieldatum im "Januar 2017"
        When ich die Teuerung für die Index-Basis: "Dezember 2015" berechne
        Then wird ein Betrag von "70281.00" CHF
        And eine Veränderung von "0.4" % angezeigt

    Scenario: Lohnteuerung Zwischenwerte
        Given ein Lohn von "70000.00" CHF
        And ein Startdatum im "Januar 2016"
        And ein Zieldatum im "Januar 2017"
        When ich die Teuerung für die Index-Basis: "Dezember 2015" berechne
        Then werden folgende Indexe aufgelistet
            | Januar 2017 | Februar 2017 | März 2017 | April 2017 | May 2017 | Juni 2017 | July 2017 | August 2017 | September 2017 | Oktober 2017 | November 2017 | Dezember 2017 |
            | 99.6        | 99.8         | 100.1     | 100.4      | 100.6    | 100.7     | 100.3     | 100.2       | 100.2          | 100.3        | 100.1         | 100.0         | 100.0 |
