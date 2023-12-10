describe('Skill Sharing', () => {
  it('submits a talk', () => {
    cy.exec('rm -f ./data/talks.json');
    cy.visit('/');

    cy.get('s-talk-form').find('input[name="title"]').type('Foobar');
    cy.get('s-talk-form').find('input[name="summary"]').type('Lorem ipsum');
    cy.get('s-talk-form').find('button[type="submit"]').click();

    cy.get('s-talks')
      .find('section.talk')
      .should(($section) => {
        expect($section.find('h2').text()).contains('Foobar');
        expect($section.find('p').text()).contains('Lorem ipsum');
      });
  });

  it('changes user and comments a talk', () => {
    cy.visit('/');

    cy.get('s-user-field')
      .find('input')
      .type('{backspace}{backspace}{backspace}{backspace}Bob');
    cy.get('s-talks').find('input[name="comment"]').type('Amazing!');
    cy.get('s-talks').find('button[type="submit"]').click();

    cy.get('s-talks')
      .find('section.talk')
      .should(($section) => {
        expect($section.find('p.comment').last().text()).contains('Bob');
        expect($section.find('p.comment').last().text()).contains('Amazing!');
      });
  });

  it('answers a comment', () => {
    cy.visit('/');

    cy.get('s-talks').find('input[name="comment"]').type('Thanks.');
    cy.get('s-talks').find('button[type="submit"]').click();

    cy.get('s-talks')
      .find('section.talk')
      .should(($section) => {
        expect($section.find('p.comment').last().text()).contains('Anon');
        expect($section.find('p.comment').last().text()).contains('Thanks.');
      });
  });
});
