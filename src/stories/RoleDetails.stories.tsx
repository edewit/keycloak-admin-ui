import React from "react";
import { Page } from "@patternfly/react-core";
import { RealmRolesForm } from "../realm-roles/RealmRoleForm";

import { MockAdminClient } from "./MockAdminClient";

import rolesMock from "../realm-roles/__tests__/mock-roles.json";

export default {
  title: "Role details tab",
  component: RealmRolesForm,
} as Meta;

export const RoleDetailsExample = () => {
  return (
    <Page>
      <MockAdminClient mock={{ roles: { findOneById: () => rolesMock[0] } }}>
        <RealmRolesForm />
      </MockAdminClient>
    </Page>
  );
};
