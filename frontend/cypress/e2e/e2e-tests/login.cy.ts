
describe('Login page - E2E', () => {
    let appUrl = "http://localhost:3000";
    it('should log the user in through the UI', () => {
      cy.visit(appUrl+'/login');
      
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
  
      //cy.url().should('include', '/dashboard');
      //cy.contains('Welcome, Test');
    });

  });
