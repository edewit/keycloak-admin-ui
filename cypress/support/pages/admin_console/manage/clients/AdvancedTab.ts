import moment from "moment";

export default class AdvancedTab {
  private setToNow = "#setToNow";
  private clear = "#clear";
  private push = "#push";

  private notBefore = "#kc-not-before";
  private advancedTab = "#pf-tab-advanced-advanced";

  goToTab() {
    cy.get(this.advancedTab).click();
    return this;
  }

  clickSetToNow() {
    cy.get(this.setToNow).click();
    return this;
  }

  checkNone() {
    cy.get(this.notBefore).should("have.value", "None");

    return this;
  }

  checkSetToNow() {
    cy.get(this.notBefore).should("have.value", moment().format("LLL"));

    return this;
  }
}
