import { Tab, TabTitleText } from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import {
  RoutableTabs,
  useRoutableTab,
} from "../../components/routable-tabs/RoutableTabs";
import { useRealm } from "../../context/realm-context/RealmContext";
import {
  ClientRegistrationTab,
  toClientRegistration,
} from "../routes/ClientRegistration";
import { ClientRegistrationList } from "./ClientRegistrationList";

export const ClientRegistration = () => {
  const { t } = useTranslation("clients");
  const { realm } = useRealm();

  const useTab = (subTab: ClientRegistrationTab) =>
    useRoutableTab(toClientRegistration({ realm, subTab }));

  const anonymousTab = useTab("anonymous");
  const authenticatedTab = useTab("authenticated");

  return (
    <RoutableTabs
      defaultLocation={toClientRegistration({ realm, subTab: "anonymous" })}
      mountOnEnter
    >
      <Tab
        data-testid="anonymous"
        title={<TabTitleText>{t("anonymousAccessPolicies")}</TabTitleText>}
        {...anonymousTab}
      >
        <ClientRegistrationList subType="anonymous" />
      </Tab>
      <Tab
        data-testid="authenticated"
        title={<TabTitleText>{t("authenticatedAccessPolicies")}</TabTitleText>}
        {...authenticatedTab}
      >
        <ClientRegistrationList subType="authenticated" />
      </Tab>
    </RoutableTabs>
  );
};
