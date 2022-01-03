import {
  AlertVariant,
  ButtonVariant,
  Card,
  CardTitle,
  DropdownItem,
  Gallery,
  GalleryItem,
  PageSection,
  Split,
  SplitItem,
  Text,
  TextContent,
  TextVariants,
} from "@patternfly/react-core";
import { DatabaseIcon } from "@patternfly/react-icons";
import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useAlerts } from "../components/alert/Alerts";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { KeycloakCard } from "../components/keycloak-card/KeycloakCard";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { toUpperCase } from "../util";
import { toProvider } from "./routes/NewProvider";

import "./user-federation.css";
import helpUrls from "../help-urls";

export default function UserFederationSection() {
  const [userFederations, setUserFederations] =
    useState<ComponentRepresentation[]>();
  const { addAlert, addError } = useAlerts();
  const { t } = useTranslation("user-federation");
  const { realm } = useRealm();
  const adminClient = useAdminClient();
  const [key, setKey] = useState(0);
  const refresh = () => setKey(new Date().getTime());

  const history = useHistory();

  const providers =
    useServerInfo().componentTypes?.[
      "org.keycloak.storage.UserStorageProvider"
    ] || [];

  useFetch(
    async () => {
      const realmModel = await adminClient.realms.findOne({ realm });
      const testParams: { [name: string]: string | number } = {
        parentId: realmModel!.id!,
        type: "org.keycloak.storage.UserStorageProvider",
      };
      return adminClient.components.find(testParams);
    },
    (userFederations) => {
      setUserFederations(userFederations);
    },
    [key]
  );

  const ufAddProviderDropdownItems = useMemo(
    () =>
      providers.map((p) => (
        <DropdownItem
          key={p.id}
          onClick={() =>
            history.push(toProvider({ realm, providerId: p.id!, id: "new" }))
          }
        >
          {toUpperCase(p.id)}
        </DropdownItem>
      )),
    []
  );

  // const learnMoreLinkProps = {
  //   title: t("common:learnMore"),
  //   href: "https://www.keycloak.org/docs/latest/server_admin/index.html#_user-storage-federation",
  // };

  let cards;

  const [currentCard, setCurrentCard] = useState("");
  const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
    titleKey: t("userFedDeleteConfirmTitle"),
    messageKey: t("userFedDeleteConfirm"),
    continueButtonLabel: "common:delete",
    continueButtonVariant: ButtonVariant.danger,
    onConfirm: async () => {
      try {
        await adminClient.components.del({ id: currentCard });
        refresh();
        addAlert(t("userFedDeletedSuccess"), AlertVariant.success);
      } catch (error) {
        addError("user-federation:userFedDeleteError", error);
      }
    },
  });

  const toggleDeleteForCard = (id: string) => {
    setCurrentCard(id);
    toggleDeleteDialog();
  };

  if (userFederations) {
    cards = userFederations.map((userFederation, index) => {
      const ufCardDropdownItems = [
        <DropdownItem
          key={`${index}-cardDelete`}
          onClick={() => {
            toggleDeleteForCard(userFederation.id!);
          }}
          data-testid="card-delete"
        >
          {t("common:delete")}
        </DropdownItem>,
      ];
      return (
        <GalleryItem
          key={index}
          className="keycloak-admin--user-federation__gallery-item"
        >
          <KeycloakCard
            id={userFederation.id!}
            dropdownItems={ufCardDropdownItems}
            providerId={userFederation.providerId!}
            title={userFederation.name!}
            footerText={toUpperCase(userFederation.providerId!)}
            labelText={
              userFederation.config!["enabled"][0] !== "false"
                ? `${t("common:enabled")}`
                : `${t("common:disabled")}`
            }
            labelColor={
              userFederation.config!["enabled"][0] !== "false" ? "blue" : "gray"
            }
          />
        </GalleryItem>
      );
    });
  }

  return (
    <>
      <ViewHeader
        titleKey="userFederation"
        subKey="user-federation:userFederationExplain"
        helpUrl={helpUrls.userFederationUrl}
        {...(userFederations && userFederations.length > 0
          ? {
              lowerDropdownItems: ufAddProviderDropdownItems,
              lowerDropdownMenuTitle: "user-federation:addNewProvider",
            }
          : {})}
      />
      <PageSection>
        {userFederations && userFederations.length > 0 ? (
          <>
            <DeleteConfirm />
            <Gallery hasGutter>{cards}</Gallery>
          </>
        ) : (
          <>
            <TextContent>
              <Text component={TextVariants.p}>{t("getStarted")}</Text>
            </TextContent>
            <TextContent>
              <Text className="pf-u-mt-lg" component={TextVariants.h2}>
                {t("providers")}
              </Text>
            </TextContent>
            <hr className="pf-u-mb-lg" />
            <Gallery hasGutter>
              {providers.map((p) => (
                <Card
                  key={p.id}
                  className="keycloak-empty-state-card"
                  isHoverable
                  onClick={() =>
                    history.push(toProvider({ realm, providerId: p.id! }))
                  }
                  data-testid={`${p.id}-card`}
                >
                  <CardTitle>
                    <Split hasGutter>
                      <SplitItem>
                        <DatabaseIcon size="lg" />
                      </SplitItem>
                      <SplitItem isFilled>
                        {t("addProvider", {
                          provider: toUpperCase(p.id!),
                          count: 4,
                        })}
                      </SplitItem>
                    </Split>
                  </CardTitle>
                </Card>
              ))}
            </Gallery>
          </>
        )}
      </PageSection>
    </>
  );
}
