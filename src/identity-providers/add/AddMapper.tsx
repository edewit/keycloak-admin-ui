import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import {
  ActionGroup,
  AlertVariant,
  Button,
  FormGroup,
  PageSection,
  TextInput,
} from "@patternfly/react-core";

import { useRealm } from "../../context/realm-context/RealmContext";

import { ViewHeader } from "../../components/view-header/ViewHeader";
import type { KeyValueType } from "../../components/attribute-form/AttributeForm";
import { FormAccess } from "../../components/form-access/FormAccess";
import { useAdminClient, useFetch } from "../../context/auth/AdminClient";
import type { IdentityProviderAddMapperParams } from "../routes/AddMapper";
import { useAlerts } from "../../components/alert/Alerts";
import type { IdentityProviderEditMapperParams } from "../routes/EditMapper";
import {
  convertFormValuesToObject,
  convertToFormValues,
  toUpperCase,
} from "../../util";
import { toIdentityProvider } from "../routes/IdentityProvider";
import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import type { IdentityProviderMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperTypeRepresentation";
import { AddMapperForm } from "./AddMapperForm";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { groupBy } from "lodash";
import {
  COMPONENTS,
  isValidComponentType,
} from "../../client-scopes/add/components/components";

export type IdPMapperRepresentationWithAttributes =
  IdentityProviderMapperRepresentation & {
    attributes: KeyValueType[];
  };

export default function AddMapper() {
  const { t } = useTranslation("identity-providers");

  const { addAlert, addError } = useAlerts();

  const { realm } = useRealm();
  const adminClient = useAdminClient();

  const { providerId, alias } = useParams<IdentityProviderAddMapperParams>();
  const { id } = useParams<IdentityProviderEditMapperParams>();

  const serverInfo = useServerInfo();
  const identityProviders = useMemo(
    () => groupBy(serverInfo.identityProviders, "groupName"),
    [serverInfo]
  );

  const isSocialIdP = useMemo(
    () =>
      identityProviders["Social"]
        .map((item) => item.id)
        .includes(providerId.toLowerCase()),
    [identityProviders, providerId]
  );

  const form = useForm<IdPMapperRepresentationWithAttributes>({
    defaultValues: {
      identityProviderMapper: isSocialIdP
        ? `${providerId.toLowerCase()}-user-attribute-mapper`
        : providerId === "saml"
        ? "saml-advanced-role-idp-mapper"
        : "hardcoded-user-session-attribute-idp-mapper",
    },
    shouldUnregister: false,
  });

  const { handleSubmit, watch } = form;

  const mapperType = watch("identityProviderMapper");

  const [mapperTypes, setMapperTypes] =
    useState<Record<string, IdentityProviderMapperTypeRepresentation>>();

  const [currentMapper, setCurrentMapper] =
    useState<IdentityProviderMapperRepresentation>();

  const save = async (idpMapper: IdentityProviderMapperRepresentation) => {
    const attributes = JSON.stringify(idpMapper.config?.attributes ?? []);
    const config = convertFormValuesToObject({
      ...idpMapper.config,
      attributes,
    });

    if (id) {
      const updatedMapper = {
        ...idpMapper,
        identityProviderAlias: alias!,
        id: id,
        name: currentMapper?.name!,
        config,
      };
      try {
        await adminClient.identityProviders.updateMapper(
          {
            id: id!,
            alias: alias!,
          },
          updatedMapper
        );
        addAlert(t("mapperSaveSuccess"), AlertVariant.success);
      } catch (error) {
        addError("identity-providers:mapperSaveError", error);
      }
    } else {
      try {
        await adminClient.identityProviders.createMapper({
          identityProviderMapper: {
            ...idpMapper,
            identityProviderAlias: alias,
            config,
          },
          alias: alias!,
        });
        addAlert(t("mapperCreateSuccess"), AlertVariant.success);
      } catch (error) {
        addError("identity-providers:mapperCreateError", error);
      }
    }
  };

  useFetch(
    () =>
      Promise.all([
        id ? adminClient.identityProviders.findOneMapper({ alias, id }) : null,
        adminClient.identityProviders.findMapperTypes({ alias }),
      ]),
    ([mapper, mapperTypes]) => {
      if (mapper) {
        setCurrentMapper(mapper);
        setupForm(mapper);
      }

      setMapperTypes(mapperTypes);
    },
    []
  );

  const setupForm = (mapper: IdentityProviderMapperRepresentation) => {
    Object.entries(mapper).map(([key, value]) => {
      if (key === "config") {
        convertToFormValues(value, "config", form.setValue);
      } else {
        form.setValue(key, value);
      }
    });
  };

  return (
    <PageSection variant="light">
      <ViewHeader
        className="kc-add-mapper-title"
        titleKey={t(id ? "editIdPMapper" : "addIdPMapper", {
          providerId: toUpperCase(providerId),
        })}
        divider
      />
      <FormAccess
        role="manage-identity-providers"
        isHorizontal
        onSubmit={handleSubmit(save)}
        className="pf-u-mt-lg"
      >
        {id && (
          <FormGroup label={t("common:id")} fieldId="kc-mapper-id">
            <TextInput
              type="text"
              value={currentMapper?.id}
              datatest-id="name-input"
              id="kc-name"
              name="name"
              isDisabled
            />
          </FormGroup>
        )}
        <AddMapperForm form={form} id={id} mapperTypes={mapperTypes} />
        <FormProvider {...form}>
          {mapperTypes?.[mapperType!]?.properties?.map((property) => {
            const componentType = property.type!;
            if (isValidComponentType(componentType)) {
              const Component = COMPONENTS[componentType];
              return <Component key={property.name} {...property} />;
            } else {
              console.warn(
                `There is no editor registered for ${componentType}`
              );
            }
          })}
        </FormProvider>
        <ActionGroup>
          <Button
            data-testid="new-mapper-save-button"
            variant="primary"
            type="submit"
          >
            {t("common:save")}
          </Button>
          <Button
            variant="link"
            component={(props) => (
              <Link
                {...props}
                to={toIdentityProvider({
                  realm,
                  providerId,
                  alias: alias!,
                  tab: "settings",
                })}
              />
            )}
          >
            {t("common:cancel")}
          </Button>
        </ActionGroup>
      </FormAccess>
    </PageSection>
  );
}
