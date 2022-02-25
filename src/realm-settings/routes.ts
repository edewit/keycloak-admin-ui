import type { RouteDef } from "../route-config";
import { KeyProviderFormRoute } from "./routes/KeyProvider";
import { RealmSettingsRoute } from "./routes/RealmSettings";
import { ClientPoliciesRoute } from "./routes/ClientPolicies";
import { AddClientProfileRoute } from "./routes/AddClientProfile";
import { ClientProfileRoute } from "./routes/ClientProfile";
import { AddExecutorRoute } from "./routes/AddExecutor";
import { ExecutorRoute } from "./routes/Executor";
import { AddClientPolicyRoute } from "./routes/AddClientPolicy";
import { EditClientPolicyRoute } from "./routes/EditClientPolicy";
import { NewClientPolicyConditionRoute } from "./routes/AddCondition";
import { EditClientPolicyConditionRoute } from "./routes/EditCondition";
import { UserProfileRoute } from "./routes/UserProfile";
import { AddAttributeRoute } from "./routes/AddAttribute";
import { KeysRoute } from "./routes/KeysTab";

const routes: RouteDef[] = [
  RealmSettingsRoute,
  KeysRoute,
  KeyProviderFormRoute,
  ClientPoliciesRoute,
  AddClientProfileRoute,
  AddExecutorRoute,
  ClientProfileRoute,
  ExecutorRoute,
  AddClientPolicyRoute,
  EditClientPolicyRoute,
  NewClientPolicyConditionRoute,
  EditClientPolicyConditionRoute,
  UserProfileRoute,
  AddAttributeRoute,
];

export default routes;
