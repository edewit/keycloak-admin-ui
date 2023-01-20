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
import { AnonymousList } from "./AnonymousList";

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
        <AnonymousList />
      </Tab>
      <Tab
        data-testid="authenticated"
        title={<TabTitleText>{t("authenticatedAccessPolicies")}</TabTitleText>}
        {...authenticatedTab}
      >
        <h1>authenticatedTab</h1>
      </Tab>
    </RoutableTabs>
  );
};
