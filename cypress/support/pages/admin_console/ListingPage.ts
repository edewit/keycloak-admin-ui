export enum Filter {
  Name = "Name",
  AssignedType = "Assigned type",
  Protocol = "Protocol",
}

export enum FilterAssignedType {
  AllTypes = "All types",
  Default = "Default",
  Optional = "Optional",
  None = "None",
}

export enum FilterProtocol {
  All = "All",
  SAML = "SAML",
  OpenID = "openid-connect", //TODO: text to be unified with item text
}

export enum FilterSession {
  AllSessionTypes = "All session types",
  RegularSSO = "Regular SSO",
  Offline = "Offline",
  DirectGrant = "Direct grant",
  ServiceAccount = "Service account",
}

export default class ListingPage {
  private searchInput = '.pf-c-toolbar__item [type="search"]:visible';
  private tableToolbar = ".pf-c-toolbar";
  private itemsRows = "table:visible";
  private deleteUserButton = "delete-user-btn";
  private emptyListImg =
    '[role="tabpanel"]:not([hidden]) [data-testid="empty-state"]';
  public emptyState = "empty-state";
  private progressBar = '[role="progressbar"]';
  private itemRowDrpDwn = ".pf-c-dropdown__toggle";
  private itemRowSelect = ".pf-c-select__toggle:nth-child(1)";
  private itemRowSelectItem = ".pf-c-select__menu-item";
  private itemCheckbox = ".pf-c-table__check";
  public exportBtn = '[role="menuitem"]:nth-child(1)';
  public deleteBtn = '[role="menuitem"]:nth-child(2)';
  private searchBtn =
    ".pf-c-page__main .pf-c-toolbar__content-section button.pf-m-control:visible";
  private listHeaderPrimaryBtn =
    ".pf-c-page__main .pf-c-toolbar__content-section .pf-m-primary:visible";
  private listHeaderSecondaryBtn =
    ".pf-c-page__main .pf-c-toolbar__content-section .pf-m-link";
  private previousPageBtn =
    "div[class=pf-c-pagination__nav-control] button[data-action=previous]:visible";
  private nextPageBtn =
    "div[class=pf-c-pagination__nav-control] button[data-action=next]:visible";
  public tableRowItem = "tbody tr[data-ouia-component-type]:visible";
  private table = "table[aria-label]";
  private filterSessionDropdownButton = ".pf-c-select button:nth-child(1)";
  private filterDropdownButton = "[class*='searchtype'] button";
  private dropdownItem = ".pf-c-dropdown__menu-item";
  private changeTypeToButton = ".pf-c-select__toggle";
  private toolbarChangeType = "#change-type-dropdown";

  showPreviousPageTableItems() {
    cy.get(this.previousPageBtn).first().click();

    return this;
  }

  showNextPageTableItems() {
    cy.get(this.nextPageBtn).first().click();

    return this;
  }

  goToCreateItem() {
    cy.get(this.listHeaderPrimaryBtn).click();

    return this;
  }

  goToImportItem() {
    cy.get(this.listHeaderSecondaryBtn).click();

    return this;
  }

  searchItem(searchValue: string, wait = true) {
    if (wait) {
      const searchUrl = `/admin/realms/master/*${searchValue}*`;
      cy.intercept(searchUrl).as("search");
    }

    cy.get(this.searchInput).clear();
    if (searchValue) {
      cy.get(this.searchInput).type(searchValue);
    }
    cy.get(this.searchBtn).click();

    if (wait) {
      cy.wait(["@search"]);
    }

    return this;
  }

  clickSearchBarActionButton() {
    cy.get(this.tableToolbar).find(this.itemRowDrpDwn).last().click();

    return this;
  }

  clickSearchBarActionItem(itemName: string) {
    cy.get(this.tableToolbar)
      .find(this.dropdownItem)
      .contains(itemName)
      .click();

    return this;
  }

  clickRowDetails(itemName: string) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find(this.itemRowDrpDwn)
      .click();
    return this;
  }

  markItemRow(itemName: string) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find('input[name*="checkrow"]')
      .click();
    return this;
  }

  removeMarkedItems() {
    cy.get(this.listHeaderSecondaryBtn).contains("Remove").click();
    return this;
  }

  checkRowColumnValue(itemName: string, column: number, value: string) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find("td:nth-child(" + column + ")")
      .should("have.text", value);
    return this;
  }

  clickDetailMenu(name: string) {
    cy.get(this.itemsRows).contains(name).click();
    return this;
  }

  clickItemCheckbox(itemName: string) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find(this.itemCheckbox)
      .click();
    return this;
  }

  clickRowSelectButton(itemName: string) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find(this.itemRowSelect)
      .click();
    return this;
  }

  clickPrimaryButton() {
    cy.get(this.listHeaderPrimaryBtn).click();

    return this;
  }

  clickRowSelectItem(rowItemName: string, selectItemName: string) {
    this.clickRowSelectButton(rowItemName);
    cy.get(this.itemRowSelectItem).contains(selectItemName).click();

    return this;
  }

  itemExist(itemName: string, exist = true) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .should((!exist ? "not." : "") + "exist");

    return this;
  }

  goToItemDetails(itemName: string) {
    cy.get(this.itemsRows).contains(itemName).click();

    return this;
  }

  checkEmptyList() {
    cy.get(this.emptyListImg).should("be.visible");

    return this;
  }

  deleteItem(itemName: string) {
    this.clickRowDetails(itemName);
    this.clickDetailMenu("Delete");

    return this;
  }

  deleteItemFromSearchBar(itemName: string) {
    this.markItemRow(itemName);
    cy.findByTestId(this.deleteUserButton).click();

    return this;
  }

  exportItem(itemName: string) {
    this.clickRowDetails(itemName);
    this.clickDetailMenu("Export");

    return this;
  }

  removeItem(itemName: string) {
    this.clickRowDetails(itemName);
    this.clickDetailMenu("Remove");

    return this;
  }

  itemsEqualTo(amount: number) {
    cy.get(this.tableRowItem).its("length").should("be.eq", amount);

    return this;
  }

  itemsGreaterThan(amount: number) {
    cy.get(this.tableRowItem).its("length").should("be.gt", amount);

    return this;
  }

  itemContainValue(itemName: string, colIndex: number, value: string) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find("td")
      .eq(colIndex)
      .should("contain", value);

    return this;
  }

  selectFilter(filter: Filter) {
    cy.get(this.filterDropdownButton).first().click();
    cy.get(this.dropdownItem).contains(filter).click();

    return this;
  }

  selectSecondaryFilter(itemName: string) {
    cy.get(this.filterDropdownButton).last().click();
    cy.get(this.itemRowSelectItem).contains(itemName).click();

    return this;
  }

  selectSecondaryFilterAssignedType(assignedType: FilterAssignedType) {
    this.selectSecondaryFilter(assignedType);

    return this;
  }

  selectSecondaryFilterProtocol(protocol: FilterProtocol) {
    this.selectSecondaryFilter(protocol);

    return this;
  }

  selectSecondaryFilterSession(sessionName: FilterSession) {
    cy.get(this.filterSessionDropdownButton).click();
    cy.get(this.itemRowSelectItem).contains(sessionName);

    return this;
  }

  changeTypeToOfSelectedItems(assignedType: FilterAssignedType) {
    cy.intercept("/admin/realms/master/client-scopes").as("load");
    cy.get(this.toolbarChangeType).click();
    cy.get(this.itemRowSelectItem).contains(assignedType).click();
    cy.wait("@load");
    return this;
  }

  changeTypeToOfItem(assignedType: FilterAssignedType, itemName: string) {
    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find(this.changeTypeToButton)
      .first()
      .click();

    cy.get(this.itemsRows)
      .contains(itemName)
      .parentsUntil("tbody")
      .find(this.changeTypeToButton)
      .contains(assignedType)
      .click();

    return this;
  }

  checkInSearchBarChangeTypeToButtonIsDisabled(disabled: boolean = true) {
    let condition = "be.disabled";
    if (!disabled) {
      condition = "be.enabled";
    }
    cy.get(this.changeTypeToButton).first().should(condition);

    return this;
  }

  checkDropdownItemIsDisabled(itemName: string, disabled: boolean = true) {
    cy.get(this.dropdownItem)
      .contains(itemName)
      .should("have.attr", "aria-disabled", String(disabled));

    return this;
  }

  checkTableExists(exists: boolean = true) {
    let condition = "be.visible";
    if (!exists) {
      condition = "not.be.visible";
    }
    cy.get(this.table).should(condition);

    return this;
  }
}
