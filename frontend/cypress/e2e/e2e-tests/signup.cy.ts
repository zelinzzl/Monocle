
describe('Signup page - E2E', () => {
  let appUrl = "http://localhost:3000";
  it('Valid user', () => {
    cy.visit(appUrl+'/signup');
    cy.get('#firstName').type('TestName');
    cy.get('#lastName').type('TestSurname');

    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('#agreeToTerms').click();

    cy.get('button[type="submit"]').click();

    //cy.url().should('include', '/dashboard');
    //cy.contains('Welcome, TestName');
  });
  
      
  it('Invalid user', () => {
    cy.visit(appUrl+'/signup');
    cy.get('#firstName').type('TestName');
    cy.get('#lastName').type('TestSurname');

    cy.get('#email').type('test@example.com');
    cy.get('#password').type('IncorrectPassword');
    cy.get('#agreeToTerms').click();

    cy.get('button[type="submit"]').click();

    //cy.url().should('include', '/dashboard');
    //cy.contains('Welcome, TestName');
  });

});
