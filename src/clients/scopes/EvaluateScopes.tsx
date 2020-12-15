import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardCopy,
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
} from "@patternfly/react-core";
import ClientScopeRepresentation from "keycloak-admin/lib/defs/clientScopeRepresentation";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";
import RoleRepresentation from "keycloak-admin/lib/defs/roleRepresentation";

import { RealmContext } from "../../context/realm-context/RealmContext";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { useAdminClient } from "../../context/auth/AdminClient";

import "./evaluate.css";
import { Table } from "@patternfly/react-table";

export type EvaluateScopesProps = {
  clientId: string;
};

export const EvaluateScopes = ({ clientId }: EvaluateScopesProps) => {
  const prefix = "openid";
  const { t } = useTranslation("clients");
  const adminClient = useAdminClient();
  const { realm } = useContext(RealmContext);
  const [selectableScopes, setSelectableScopes] = useState<
    ClientScopeRepresentation[]
  >([]);
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([prefix]);

  const [userItems, setUserItems] = useState<JSX.Element[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [user, setUser] = useState<UserRepresentation>();

  const [effectiveRoles, setEffectiveRoles] = useState<RoleRepresentation[]>(
    []
  );
  useEffect(() => {
    (async () => {
      const optionalClientScopes = await adminClient.clients.listOptionalClientScopes(
        { id: clientId }
      );
      setSelectableScopes(optionalClientScopes);
    })();
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
    (async () => {
      if (userSearch.length > 2) {
        const users = await adminClient.users.find({ search: userSearch });
        setUserItems(
          users
            .map((user) => {
              user.toString = function () {
                return toString(this);
              };
              return user;
            })
            .map((user) => <SelectOption key={user.id} value={user} />)
        );
      } else {
        setUserItems([]);
      }
    })();
  }, [userSearch]);

  useEffect(() => {
    (async () => {
      const scope = selected.join(" ");
      setEffectiveRoles(
        await adminClient.clients.evaluatePermission({
          id: clientId,
          roleContainer: realm,
          scope,
          type: "granted",
        })
      );

      const listProtocolMapper = await adminClient.clients.evaluateListProtocolMapper(
        { id: clientId, scope }
      );

      console.log(effectiveRoles);
      console.log(listProtocolMapper);
    })();
  }, [selected]);

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
      <Tabs isVertical style={{ position: "fixed", right: "0" }}>
        <Tab
          eventKey={0}
          title={<TabTitleText>{t("common:settings")}</TabTitleText>}
        >
          {effectiveRoles.map((role) => (
            <div key={role.id}>{role.name}</div>
          ))}
        </Tab>
      </Tabs>
    </>
  );
};
