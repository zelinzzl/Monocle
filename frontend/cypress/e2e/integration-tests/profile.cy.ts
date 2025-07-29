describe('Profile Page - Integration', () => {
    const appUrl = 'http://localhost:3000/dashboard/profile';
  
    // beforeEach(() => {
    //   cy.visit(appUrl);
    // });
  
    it('renders profile information correctly', () => {
      // cy.contains('Profile').should('exist');
      // cy.get('input#name').should('have.value', 'John Doe');
      // cy.get('input#email').should('have.value', 'john@example.com');
      // cy.get('textarea#bio').should('have.value', 'Frontend developer with a love for clean UI.');
      // cy.get('input#picture').should('have.value', 'https://example.com/avatar.jpg');
      // cy.get('img[alt="Profile preview"]').should('have.attr', 'src', 'https://example.com/avatar.jpg');
    });
  
    it('enables editing and saves updated data', () => {
      // cy.contains('Change Information').click();
  
      // // Edit name and bio
      // cy.get('input#name').clear().type('Jane Doe');
      // cy.get('textarea#bio').clear().type('Updated bio for Jane.');
  
      // // Toggle email notifications and 2FA
      // cy.get('input#emailNotifications').click();
      // cy.get('input#twoFactorAuth').click();
  
      // // Save changes
      // cy.contains('Save Changes').click();
  
      // // Ensure buttons switch back
      // cy.contains('Change Information').should('exist');
  
      // // Ensure fields are updated and disabled again
      // cy.get('input#name').should('have.value', 'Jane Doe').should('be.disabled');
      // cy.get('textarea#bio').should('have.value', 'Updated bio for Jane.').should('be.disabled');
    });
  
    it('cancels edit mode without saving changes', () => {
      //cy.contains('Change Information').click();
  
      // // Modify a field
      // cy.get('input#name').clear().type('Cancelled Name');
  
      // // Cancel the edit
      // cy.contains('Cancel').click();
  
      // // Field should revert to original
      // cy.get('input#name').should('have.value', 'John Doe');
    });
  });
  