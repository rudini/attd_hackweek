Feature: Visiting Google

    Check if google looks ok

    Scenario: Normal search
        Given I open Google page
        Then  I see "Google" in the title