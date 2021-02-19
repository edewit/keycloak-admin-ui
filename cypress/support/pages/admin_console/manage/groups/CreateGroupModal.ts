/// <reference types="../../../.." />

export default class CreateGroupModal {
  private nameInput = "groupNameInput";
  private createButton = "createGroup";

  fillGroupForm(name = "") {
    cy.getBy(this.nameInput).clear();
    cy.getBy(this.nameInput).type(name);
    return this;
  }

  clickCreate() {
    cy.getBy(this.createButton).click();
    return this;
  }
}
