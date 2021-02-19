export default class CreateGroupModal {
  private nameInput = "groupNameInput";
  private createButton = "createGroup";

  fillGroupForm(name = "") {
    cy.getId(this.nameInput).clear();
    cy.getId(this.nameInput).type(name);
    return this;
  }

  clickCreate() {
    cy.getId(this.createButton).click();
    return this;
  }
}
