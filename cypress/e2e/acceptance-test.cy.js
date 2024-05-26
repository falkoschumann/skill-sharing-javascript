describe('Skill Sharing', () => {
  let skillSharing;

  it('submits a talk', () => {
    skillSharing = new SkillSharing();
    skillSharing.goToSubmission();

    skillSharing.submitTalk('Foobar', 'Lorem ipsum');

    skillSharing.assertTalkAdded('Foobar', 'Lorem ipsum');
  });

  it('changes user and comments a talk', () => {
    skillSharing.goToSubmission();
    skillSharing.changeUser('Bob');

    skillSharing.commentOnTalk('Amazing!');

    skillSharing.assertCommentAdded('Bob', 'Amazing!');
  });

  it('answers a comment', () => {
    skillSharing.goToSubmission();

    skillSharing.commentOnTalk('Thanks.');

    skillSharing.assertCommentAdded('Anon', 'Thanks.');
  });
});

class SkillSharing {
  constructor() {
    cy.exec('rm -f ./data/talks.json');
  }

  goToSubmission() {
    cy.visit('/');
  }

  submitTalk(title, summary) {
    cy.get('s-talk-form').find('input[name="title"]').type(title);
    cy.get('s-talk-form').find('textarea[name="summary"]').type(summary);
    cy.get('s-talk-form').find('button[type="submit"]').click();
  }

  commentOnTalk(comment) {
    cy.get('s-talks').find('input[name="comment"]').type(comment);
    cy.get('s-talks').find('button[type="submit"]').click();
  }

  changeUser(name) {
    cy.get('s-user-field').find('input[name="username"]').clear();
    cy.get('s-user-field').find('input[name="username"]').type(name);
  }

  assertTalkAdded(title, summary) {
    cy.get('s-talks')
      .find('section.talk')
      .last()
      .should(($section) => {
        expect($section.find('h2').text()).contains(title);
        expect($section.find('p').text()).contains(summary);
      });
  }

  assertCommentAdded(author, comment) {
    cy.get('s-talks')
      .find('section.talk')
      .last()
      .should(($section) => {
        expect($section.find('.comment').last().text()).contains(author);
        expect($section.find('.comment').last().text()).contains(comment);
      });
  }
}
