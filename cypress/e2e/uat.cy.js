describe('Skill Sharing', () => {
  it('submits a talk', () => {
    cy.exec('rm -f ./data/talks.json');

    cy.visit('/');

    cy.get('s-talkform').find('input[name="title"]').type('Foobar');
    cy.get('s-talkform').find('input[name="summary"]').type('Lorem ipsum');
    cy.get('s-talkform').find('form').submit();
  });

  it('changes user and comments a talk', () => {
    cy.visit('/');

    cy.get('s-userfield')
      .find('input')
      .type('{backspace}{backspace}{backspace}{backspace}Bob');

    cy.get('s-talks').find('input[name="comment"]').type('Amazing!');
    cy.get('s-talks').find('form').submit();
  });

  it('answers a comment', () => {
    cy.visit('/');

    cy.get('s-talks').find('input[name="comment"]').type('Thanks.');
    cy.get('s-talks').find('form').submit();
  });
});
