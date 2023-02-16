import {
  DataList,
  PageSection,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLinkedAccounts } from "../api/methods";
import { LinkedAccountRepresentation } from "../api/representations";
import { usePromise } from "../utils/usePromise";
import { AccountRow } from "./AccountRow";

const LinkedAccounts = () => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<LinkedAccountRepresentation[]>([]);

  const [key, setKey] = useState(1);
  const refresh = () => setKey(key + 1);

  usePromise((signal) => getLinkedAccounts({ signal }), setAccounts, [key]);

  return (
    <PageSection isFilled variant="light">
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" className="pf-u-mb-lg" size="xl">
            {t("linkedLoginProviders")}
          </Title>
          <DataList id="linked-idps" aria-label={t("linkedLoginProviders")}>
            {accounts
              .filter((account) => account.connected)
              .map((account) => (
                <AccountRow
                  key={account.providerName}
                  account={account}
                  isLinked
                  refresh={refresh}
                />
              ))}
          </DataList>
        </StackItem>
        <StackItem>
          <Title headingLevel="h2" className="pf-u-mt-xl pf-u-mb-lg" size="xl">
            {t("unlinkedLoginProviders")}{" "}
          </Title>
          <DataList id="unlinked-idps" aria-label={t("unlinkedLoginProviders")}>
            {accounts
              .filter((account) => !account.connected)
              .map((account) => (
                <AccountRow
                  key={account.providerName}
                  account={account}
                  refresh={refresh}
                />
              ))}
          </DataList>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default LinkedAccounts;
