describe('App smoke tests', () => {
  it('redirects to the login page from the root route', () => {
    cy.visit('/');
    cy.location('pathname').should('match', /\/login$/);
    cy.contains('Iniciar sesión').should('exist');
  });

  it('shows the login inputs and access buttons', () => {
    cy.visit('/login');
    cy.get('ion-input').should('have.length.at.least', 2);
    cy.contains('Correo electrónico').should('exist');
    cy.contains('Contraseña').should('exist');
    cy.contains('¿No tienes cuenta? Regístrate aquí').should('exist');
    cy.contains('¿Olvidaste tu contraseña?').should('exist');
  });
});