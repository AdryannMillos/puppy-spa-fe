describe('Waiting List Component', () => {
  beforeEach(() => {
    cy.intercept('GET', '/appointment?date=2023-06-14', {
      statusCode: 200,
      body: {
        attended: [
          { id: 1, service: 'Grooming', arrivalTime: '2023-06-14T08:30:00Z', attended: true, puppy: 'Buddy', order: 1 }
        ],
        unattended: [
          { id: 2, service: 'Vaccination', arrivalTime: '2023-06-14T09:00:00Z', attended: false, puppy: 'Max', order: 2 }
        ]
      }
    }).as('fetchAppointments');

    cy.visit('/waiting-list');
  });

  it('should render the waiting list with attended and unattended sections', () => {
    cy.wait('@fetchAppointments', { timeout: 10000 }); // Increased timeout

    cy.get('h1').contains('Waiting List').should('be.visible');
    cy.get('h1').contains('Unattended').should('be.visible');
    cy.get('h1').contains('Attended').should('be.visible');

    cy.get('div').contains('Grooming').should('be.visible');
    cy.get('div').contains('Vaccination').should('be.visible');
  });

  it('should update the list on date change', () => {
    // Intercept the new request for changing the date
    cy.intercept('GET', '/appointment?date=2023-06-15', {
      statusCode: 200,
      body: {
        attended: [
          { id: 3, service: 'Training', arrivalTime: '2023-06-15T10:00:00Z', attended: true, puppy: 'Bella', order: 1 }
        ],
        unattended: [
          { id: 4, service: 'Checkup', arrivalTime: '2023-06-15T10:30:00Z', attended: false, puppy: 'Charlie', order: 2 }
        ]
      }
    }).as('fetchAppointmentsNewDate');

    // Change the date
    cy.get('input[type="date"]').clear().type('2023-06-15');

    cy.wait('@fetchAppointmentsNewDate', { timeout: 10000 }); // Increased timeout

    cy.get('div').contains('Training').should('be.visible');
    cy.get('div').contains('Checkup').should('be.visible');
  });

  it('should allow scheduling a new puppy appointment', () => {
    // Mock the API response for scheduling an appointment
    cy.intercept('POST', '/appointment/schedule-puppy', {
      statusCode: 200,
      body: {
        message: 'Puppy scheduled successfully',
      }
    }).as('schedulePuppy');

    // Fill the schedule form and submit
    cy.get('input[placeholder="Service"]').type('Dental Cleaning');
    cy.get('select').select('Puppy ID'); // Adjust the selector based on your searchable select component
    cy.get('button').contains('Submit').click();

    cy.wait('@schedulePuppy', { timeout: 10000 }); // Increased timeout

    cy.get('div').contains('Dental Cleaning').should('be.visible');
  });
});
