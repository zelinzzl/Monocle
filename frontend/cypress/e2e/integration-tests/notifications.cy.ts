describe("Notifications - Integration", () => {
  const appUrl = "http://localhost:3000/home";

  it("should load and display notifications", () => {
    cy.visit(appUrl + "/notifications");

    // Wait for loading state
    //cy.contains('Loading notifications...', { timeout: 5000 }).should('exist');

    // Wait for loading to finish
    //cy.contains('Loading notifications...').should('not.exist');

    // Check for page heading
    cy.contains("Notifications").should("be.visible");

    // Either shows "No notifications yet" or some alerts
    cy.get("main").then(($main) => {
      if ($main.text().includes("No notifications yet")) {
        cy.contains("No notifications yet").should("be.visible");
      } else {
        // Confirm at least one alert card is rendered
        cy.get('[class*="rounded-lg"]').should("have.length.greaterThan", 0);

        // Check for common alert features
        cy.get('[class*="rounded-lg"]')
          .first()
          .within(() => {
            cy.get("svg").should("exist"); // icon
            cy.get("span")
              .contains(/Price alert/i)
              .should("exist"); // title
            cy.get("span").contains(/ago/i).should("exist"); // timestamp
          });
      }
    });
  });
});
