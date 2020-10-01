import React, { useContext, useState, useEffect } from "react";
import {
  Alert,
  AlertVariant,
  Select,
  SelectOption,
  SelectVariant,
  Stack,
  StackItem,
  TextArea,
} from "@patternfly/react-core";
// import serverInfo from "../../clients/__tests__/mock-serverinfo.json";
import { ConfirmDialogModal } from "../confirm-dialog/ConfirmDialog";
import { HttpClientContext } from "../../http-service/HttpClientContext";
import { RealmContext } from "../realm-context/RealmContext";

export type DownloadDialogProps = {
  id: string;
  protocol?: string;
};

const serverInfo = [
  {
    id: "keycloak-oidc-jboss-subsystem-cli",
    protocol: "openid-connect",
    downloadOnly: false,
    displayType: "Keycloak OIDC JBoss Subsystem CLI",
    helpText:
      "CLI script you must edit and apply to your client app server. This type of configuration is useful when you can't or don't want to crack open your WAR file.",
    filename: "keycloak-oidc-subsystem.cli",
    mediaType: "text/plain",
  },
  {
    id: "keycloak-oidc-jboss-subsystem",
    protocol: "openid-connect",
    downloadOnly: false,
    displayType: "Keycloak OIDC JBoss Subsystem XML",
    helpText:
      "XML snippet you must edit and add to the Keycloak OIDC subsystem on your client app server.  This type of configuration is useful when you can't or don't want to crack open your WAR file.",
    filename: "keycloak-oidc-subsystem.xml",
    mediaType: "application/xml",
  },
  {
    id: "keycloak-oidc-keycloak-json",
    protocol: "openid-connect",
    downloadOnly: false,
    displayType: "Keycloak OIDC JSON",
    helpText:
      "keycloak.json file used by the Keycloak OIDC client adapter to configure clients.  This must be saved to a keycloak.json file and put in your WEB-INF directory of your WAR file.  You may also want to tweak this file after you download it.",
    filename: "keycloak.json",
    mediaType: "application/json",
  },
];

export const DownloadDialog = ({
  id,
  protocol = "openid-connect",
}: DownloadDialogProps) => {
  const httpClient = useContext(HttpClientContext)!;
  const { realm } = useContext(RealmContext);
  const configFormats = serverInfo; //serverInfo.clientInstallations[protocol];
  const [selected, setSelected] = useState(
    configFormats[configFormats.length - 1].id
  );
  const [snippet, setSnippet] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await httpClient.doGet<string>(
        `admin/${realm}/master/clients/${id}/installation/providers/${selected}`
      );
      setSnippet(response.data!);
    })();
  }, [snippet]);
  return (
    <ConfirmDialogModal
      titleKey="Download adaptor configs"
      continueButtonLabel="Download"
      onConfirm={() => {}}
      open={true}
      toggleDialog={() => {}}
    >
      <Stack hasGutter>
        <StackItem>
          <Alert
            id={id}
            title="Description"
            variant={AlertVariant.info}
            isInline
          >
            {
              configFormats.find((configFormat) => configFormat.id === selected)
                ?.helpText
            }
          </Alert>
        </StackItem>
        <StackItem>
          <Select
            isOpen={open}
            onToggle={() => setOpen(!open)}
            variant={SelectVariant.single}
            value={selected}
            selections={selected}
            onSelect={(_, value) => setSelected(value as string)}
            aria-label="Select Input"
          >
            {configFormats.map((configFormat) => (
              <SelectOption
                key={configFormat.id}
                value={configFormat.id}
                isSelected={selected === configFormat.id}
              >
                {configFormat.displayType}
              </SelectOption>
            ))}
          </Select>
        </StackItem>
        <StackItem isFilled>
          <TextArea
            readOnly
            rows={12}
            resizeOrientation="vertical"
            value={snippet}
            aria-label="text area example"
          />
        </StackItem>
      </Stack>
    </ConfirmDialogModal>
  );
};
