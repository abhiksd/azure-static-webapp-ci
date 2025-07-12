describe('Azure Static Web App E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the home page successfully', () => {
    cy.checkPageLoad()
    cy.containsText('h1', 'Azure Static Web App')
    cy.containsText('h2', 'Welcome to Azure Static Web Apps')
    cy.get('[data-testid="current-time"]').should('exist')
  })

  it('should navigate between pages', () => {
    // Test Home page
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    
    // Navigate to About page
    cy.navigateTo('About')
    cy.url().should('include', '/about')
    cy.containsText('h2', 'About This Application')
    
    // Navigate to Contact page
    cy.navigateTo('Contact')
    cy.url().should('include', '/contact')
    cy.containsText('h2', 'Contact Us')
    
    // Navigate back to Home
    cy.navigateTo('Home')
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
  })

  it('should display feature cards on home page', () => {
    cy.get('.feature-card').should('have.length.at.least', 4)
    cy.containsText('.feature-card', 'Multi-Environment Deployment')
    cy.containsText('.feature-card', 'Security Scanning')
    cy.containsText('.feature-card', 'Semantic Versioning')
    cy.containsText('.feature-card', 'Release Branches')
  })

  it('should display deployment strategy table', () => {
    cy.get('table').should('be.visible')
    cy.get('th').should('contain.text', 'Environment')
    cy.get('th').should('contain.text', 'Trigger')
    cy.get('th').should('contain.text', 'Version Format')
    cy.get('tbody tr').should('have.length.at.least', 3)
  })

  it('should display footer information', () => {
    cy.get('footer').should('be.visible')
    cy.get('.version-info').should('contain.text', 'Version:')
    cy.get('.environment-info').should('contain.text', 'Environment:')
    cy.get('.footer-links').should('be.visible')
  })

  it('should submit contact form successfully', () => {
    cy.navigateTo('Contact')
    
    // Fill out the form
    cy.fillContactForm('John Doe', 'john.doe@example.com', 'This is a test message for the Azure Static Web App.')
    
    // Submit the form
    cy.get('.submit-button').click()
    
    // Check for success message
    cy.get('.success-message').should('be.visible')
    cy.containsText('.success-message', 'Thank You!')
    cy.containsText('.success-message', 'Your message has been submitted successfully')
  })

  it('should be responsive on mobile devices', () => {
    // Test mobile viewport
    cy.viewport(375, 667) // iPhone SE dimensions
    
    cy.checkPageLoad()
    
    // Check navigation is mobile-friendly
    cy.get('nav').should('be.visible')
    cy.get('.navigation ul').should('be.visible')
    
    // Check feature cards stack properly
    cy.get('.features-grid').should('be.visible')
    
    // Test contact form on mobile
    cy.navigateTo('Contact')
    cy.get('.contact-form').should('be.visible')
    cy.get('#name').should('be.visible')
  })

  it('should have proper accessibility features', () => {
    // Check for proper heading hierarchy
    cy.get('h1').should('exist')
    cy.get('h2').should('exist')
    
    // Check for alt text on images (if any)
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt')
    })
    
    // Check for proper form labels
    cy.navigateTo('Contact')
    cy.get('label[for="name"]').should('exist')
    cy.get('label[for="email"]').should('exist')
    cy.get('label[for="message"]').should('exist')
    
    // Check for focus indicators
    cy.get('#name').focus().should('have.focus')
  })
})