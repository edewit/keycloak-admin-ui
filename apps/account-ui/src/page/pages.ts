import { ComponentType } from "react";
import { AccountPage } from "./AccountPage";
import { ApplicationsPage } from "./ApplicationsPage";
import { SigningInPage } from "./SigningInPage";
import { DeviceActivityPage } from "./DeviceActivityPage";

const Pages: Record<string, ComponentType | undefined> = {
  AccountPage,
  SigningInPage,
  DeviceActivityPage,
  ApplicationsPage,
};

export default Pages;
