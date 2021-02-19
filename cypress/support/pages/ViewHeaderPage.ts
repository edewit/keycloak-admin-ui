export default class ListingPage {
  private actionMenu = "viewheader-action";

  clickAction(action: string) {
    cy.get("[data-cy=action-dropdown]").click().getBy(action).click();
    return this;
  }
}
