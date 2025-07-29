describe('Travel Risks - Integration', () => {
    const appUrl = 'http://localhost:3000/dashboard';
  
    it('should add, edit, and delete a travel risk record', () => {
      cy.visit(appUrl + '/travel-risk');
  
      // Page header
     // cy.contains('Travel Risks').should('be.visible');
  
      // Add new risk
    //   cy.contains('ADD NEW RISK').click();
    //   cy.wait(3000); // Simulate user reading modal
  
    //   cy.get('input[placeholder="Name"]').type('Cape Town');
    //   cy.get('select').select('High');
    //   cy.contains('Add Risk').click();
  
      // Confirm new row appears
    //   cy.contains('Cape Town').should('exist');
    //   cy.contains('High').should('exist');
  
      // Edit the added row
    //   cy.get('svg').filter('[class*="Pencil"]').first().click();
    //   cy.wait(200);
    //   cy.get('input[placeholder="Name"]').clear().type('Cape Town Edited');
    //   cy.get('select').select('Medium');
    //   cy.contains('Update Risk').click();
  
      // Confirm update
    //   cy.contains('Cape Town Edited').should('exist');
    //   cy.contains('Medium').should('exist');
  
      // Delete the row
      //cy.get('svg').filter('[class*="Trash2"]').first().click();
  
      // Confirm deletion
      //cy.contains('Cape Town Edited').should('not.exist');
    });
  });
  