import { createContext } from "react";
import KeycloakAdminClient from "keycloak-admin";

export const AdminClient = createContext<KeycloakAdminClient | undefined>(
  undefined
);