// cypress/e2e/login.cy.js

describe('Login Component', () => {
    beforeEach(() => {
      cy.intercept('POST', '/auth/signin', (req) => {
        const { email, password } = req.body;
        if (email === 'test@example.com' && password === 'password') {
          req.reply({
            statusCode: 200,
            body: {
              access_token: 'fake_access_token',
            },
          });
        } else {
          req.reply({
            statusCode: 401,
            body: {
              message: 'Invalid credentials',
            },
          });
        }
      }).as('loginRequest');
  
      cy.visit('/');
    });
  
    it('should render the login form', () => {
      cy.get('h1').contains('Login').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').contains('Login').should('be.visible');
    });
  
    it('should display error message on failed login', () => {
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@loginRequest');
  
      cy.get('p').contains('Invalid credentials').should('be.visible');
    });
  
    it('should redirect to waiting list on successful login', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(localStorage.getItem('access_token')).to.equal('fake_access_token');
      });
  
      cy.url().should('include', '/waiting-list');
    });
  });
  