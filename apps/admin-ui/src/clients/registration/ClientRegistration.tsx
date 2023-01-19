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

export const ClientRegistration = () => {
  const { t } = useTranslation("clients");
  const { realm } = useRealm();

  const useTab = (tab: ClientRegistrationTab) =>
    useRoutableTab(toClientRegistration({ realm, tab }));

  const anonymousTab = useTab("anonymous");
  const authenticatedTab = useTab("authenticated");

  return (
    <RoutableTabs
      defaultLocation={toClientRegistration({ realm, tab: "anonymous" })}
      mountOnEnter
    >
      <Tab
        data-testid="anonymous"
        title={<TabTitleText>{t("clientsList")}</TabTitleText>}
        {...anonymousTab}
      >
        <h1>subtab</h1>
      </Tab>
      <Tab
        data-testid="authenticated"
        title={<TabTitleText>{t("clientsList")}</TabTitleText>}
        {...authenticatedTab}
      >
        <h1>authenticatedTab</h1>
      </Tab>
    </RoutableTabs>
  );
};
