import React from "react";
import { Page } from "@patternfly/react-core";
import { Meta } from "@storybook/react";

import { MockAdminClient } from "./MockAdminClient";
import { RealmRoleForm } from "../realm-roles/RealmRoleForm";

export default {
  title: "New role form",
  component: RealmRoleForm,
} as Meta;

export const View = () => {
  return (
    <Page>
      <MockAdminClient>
        <RealmRoleForm />
      </MockAdminClient>
    </Page>
  );
};
