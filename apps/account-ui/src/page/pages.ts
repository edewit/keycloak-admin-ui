import { ComponentType } from "react";
import { AccountPage } from "./AccountPage";
// import { ApplicationsPage } from "./ApplicationsPage";
// import { SigningInPage } from "./SigningInPage";

const Pages: Record<string, ComponentType | undefined> = {
  AccountPage,
  // SigningInPage,
  // ApplicationsPage,
};

export default Pages;
