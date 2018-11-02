Feature: Visiting Google

    Check if google looks ok

    Scenario: Normal search
        When I open Google page
        Then I see "Google" in the title

    Scenario: Specific search
        Given A Google page
        When I search for "typescript"
        Then I see "typescript" in the title