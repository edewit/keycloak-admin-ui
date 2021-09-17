import type { FC } from "react";

import type { ConfigPropertyRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation";
import { StringComponent } from "./StringComponent";
import { BooleanComponent } from "./BooleanComponent";
import { ListComponent } from "./ListComponent";
import { RoleComponent } from "./RoleComponent";
import { ScriptComponent } from "./ScriptComponent";

export type ComponentProps = Omit<ConfigPropertyRepresentation, "type">;
export const ComponentTypes: ReadonlyArray<string> = [
  "String",
  "boolean",
  "List",
  "Role",
  "Script",
];

export type Components = typeof ComponentTypes[number];

export const COMPONENTS: { [index in Components]: FC<ComponentProps> } = {
  String: StringComponent,
  boolean: BooleanComponent,
  List: ListComponent,
  Role: RoleComponent,
  Script: ScriptComponent,
} as const;
