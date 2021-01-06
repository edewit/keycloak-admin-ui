import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardCopy,
  EmptyState,
  EmptyStateBody,
  Form,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
  Tab,
  Tabs,
  TabTitleText,
  TextArea,
  Title,
} from "@patternfly/react-core";
import ClientScopeRepresentation from "keycloak-admin/lib/defs/clientScopeRepresentation";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import RoleRepresentation from "keycloak-admin/lib/defs/roleRepresentation";
import ProtocolMapperRepresentation from "keycloak-admin/lib/defs/protocolMapperRepresentation";
import { ProtocolMapperTypeRepresentation } from "keycloak-admin/lib/defs/serverInfoRepesentation";

import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { RealmContext } from "../../context/realm-context/RealmContext";
import { KeycloakDataTable } from "../../components/table-toolbar/KeycloakDataTable";
import { HelpItem } from "../../components/help-enabler/HelpItem";

import "./evaluate.css";

export type EvaluateScopesProps = {
  clientId: string;
  protocol: string;
};

export const EvaluateScopes = ({ clientId, protocol }: EvaluateScopesProps) => {
  const prefix = "openid";
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();
  const { realm } = useContext(RealmContext);
  const mapperTypes = useServerInfo().protocolMapperTypes![protocol];

  const [selectableScopes, setSelectableScopes] = useState<
    ClientScopeRepresentation[]
  >([]);
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([prefix]);
  const [activeTab, setActiveTab] = useState(0);

  const [userItems, setUserItems] = useState<JSX.Element[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [user, setUser] = useState<UserRepresentation>();

  const [key, setKey] = useState("");
  const refresh = () => setKey(`${new Date().getTime()}`);
  const [effectiveRoles, setEffectiveRoles] = useState<RoleRepresentation[]>(
    []
  );
  const [protocolMappers, setProtocolMappers] = useState<
    ProtocolMapperRepresentation[]
  >([]);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    return useFetch(
      () => adminClient.clients.listOptionalClientScopes({ id: clientId }),
      (optionalClientScopes) => setSelectableScopes(optionalClientScopes)
    );
  }, []);

  const toString = (user: UserRepresentation) => {
    return (
      t("common:fullName", {
        givenName: user.firstName,
        familyName: user.lastName,
      }).trim() ||
      user.username ||
      ""
    );
  };

  useEffect(() => {
    return useFetch(
      () => {
        if (userSearch.length > 2) {
          return adminClient.users.find({ search: userSearch });
        } else {
          return Promise.resolve<UserRepresentation[]>([]);
        }
      },
      (users) =>
        setUserItems(
          users
            .map((user) => {
              user.toString = function () {
                return toString(this);
              };
              return user;
            })
            .map((user) => <SelectOption key={user.id} value={user} />)
        )
    );
  }, [userSearch]);

  useEffect(() => {
    return useFetch(
      async () => {
        const scope = selected.join(" ");
        const effectiveRoles = await adminClient.clients.evaluatePermission({
          id: clientId,
          roleContainer: realm,
          scope,
          type: "granted",
        });

        const mapperList = (await adminClient.clients.evaluateListProtocolMapper(
          {
            id: clientId,
            scope,
          }
        )) as ({
          type: ProtocolMapperTypeRepresentation;
        } & ProtocolMapperRepresentation)[];

        return {
          mapperList,
          effectiveRoles,
        };
      },
      ({ mapperList, effectiveRoles }) => {
        setEffectiveRoles(effectiveRoles);
        mapperList.map((mapper) => {
          mapper.type = mapperTypes.filter(
            (type) => type.id === mapper.protocolMapper
          )[0];
        });

        setProtocolMappers(mapperList);
        refresh();
      }
    );
  }, [selected]);

  useEffect(() => {
    return useFetch(
      () => {
        const scope = selected.join(" ");
        if (user) {
          return adminClient.clients.evaluateGenerateAccessToken({
            id: clientId,
            userId: user.id!,
            scope,
          });
        } else {
          return Promise.resolve({});
        }
      },
      (accessToken) => {
        setAccessToken(JSON.stringify(accessToken, undefined, 3));
      }
    );
  }, [user, selected]);

  return (
    <>
      <Form isHorizontal>
        <FormGroup
          label={t("scopeParameter")}
          fieldId="kc-scope-parameter"
          labelIcon={
            <HelpItem
              helpText="clients-help:scopeParameter"
              forLabel={t("scopeParameter")}
              forID="scopeParameter"
            />
          }
        >
          <Split hasGutter>
            <SplitItem isFilled>
              <Select
                id="scopeParameter"
                variant={SelectVariant.typeaheadMulti}
                typeAheadAriaLabel={t("scopeParameter")}
                onToggle={() => setIsScopeOpen(!isScopeOpen)}
                isOpen={isScopeOpen}
                selections={selected}
                onSelect={(_, value) => {
                  const option = value as string;
                  if (selected.includes(option)) {
                    if (option !== prefix) {
                      setSelected(selected.filter((item) => item !== option));
                    }
                  } else {
                    setSelected([...selected, option]);
                  }
                }}
                aria-labelledby={t("scopeParameter")}
                placeholderText={t("scopeParameterPlaceholder")}
              >
                {selectableScopes.map((option, index) => (
                  <SelectOption key={index} value={option.name} />
                ))}
              </Select>
            </SplitItem>
            <SplitItem>
              <ClipboardCopy className="keycloak__scopes_evaluate__clipboard-copy">
                {selected.join(" ")}
              </ClipboardCopy>
            </SplitItem>
          </Split>
        </FormGroup>
        <FormGroup
          label={t("user")}
          fieldId="kc-user"
          labelIcon={
            <HelpItem
              helpText="clients-help:user"
              forLabel={t("user")}
              forID="user"
            />
          }
        >
          <Select
            id="user"
            variant={SelectVariant.typeahead}
            typeAheadAriaLabel={t("user")}
            onToggle={() => setIsUserOpen(!isUserOpen)}
            onFilter={(e) => {
              const value = e.target.value;
              setUserSearch(value);
              return [];
            }}
            onClear={() => setUser(undefined)}
            selections={[user]}
            onSelect={(_, value) => {
              setUser(value as UserRepresentation);
              setUserSearch("");
              setIsUserOpen(false);
            }}
            isOpen={isUserOpen}
          >
            {userItems}
          </Select>
        </FormGroup>
      </Form>
      <Tabs
        key={key}
        isVertical
        activeKey={activeTab}
        onSelect={(_, key) => setActiveTab(key as number)}
      >
        <Tab
          eventKey={0}
          title={<TabTitleText>{t("effectiveProtocolMappers")}</TabTitleText>}
        >
          <KeycloakDataTable
            loader={() => Promise.resolve(protocolMappers)}
            ariaLabelKey="clients:effectiveProtocolMappers"
            searchPlaceholderKey="clients:searchForProtocol"
            columns={[
              {
                name: "mapperName",
                displayKey: "clients:name",
              },
              {
                name: "containerName",
                displayKey: "clients:parentClientScope",
              },
              {
                name: "type.category",
                displayKey: "clients:category",
              },
              {
                name: "type.priority",
                displayKey: "clients:priority",
              },
            ]}
          />
        </Tab>
        <Tab
          eventKey={1}
          title={<TabTitleText>{t("effectiveRoleScopeMappings")}</TabTitleText>}
        >
          <KeycloakDataTable
            loader={() => Promise.resolve(effectiveRoles)}
            ariaLabelKey="client:effectiveRoleScopeMappings"
            searchPlaceholderKey="clients:searchForRole"
            columns={[
              {
                name: "name",
                displayKey: "clients:role",
              },
              {
                name: "containerId",
                displayKey: "clients:origin",
              },
            ]}
          />
        </Tab>
        <Tab
          eventKey={2}
          title={<TabTitleText>{t("generatedAccessToken")}</TabTitleText>}
        >
          {user && <TextArea rows={20} id="accessToken" value={accessToken} />}
          {!user && (
            <EmptyState variant="large">
              <Title headingLevel="h4" size="lg">
                {t("noGeneratedAccessToken")}
              </Title>
              <EmptyStateBody>
                {t("generatedAccessTokenIsDisabled")}
              </EmptyStateBody>
            </EmptyState>
          )}
        </Tab>
      </Tabs>
    </>
  );
};
