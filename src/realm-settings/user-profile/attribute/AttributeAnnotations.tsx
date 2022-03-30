import React, { useEffect, useState } from "react";
import { FormGroup, Grid, GridItem } from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { FormAccess } from "../../../components/form-access/FormAccess";
import { FormProvider, useFormContext } from "react-hook-form";
import { AttributeInput } from "../../../components/attribute-input/AttributeInput";
import "../../realm-settings-section.css";
import type { AttributeParams } from "../../routes/Attribute";
import { useParams } from "react-router-dom";
import { useAdminClient, useFetch } from "../../../context/auth/AdminClient";

export const AttributeAnnotations = () => {
  const { t } = useTranslation("realm-settings");
  const form = useFormContext();
  const adminClient = useAdminClient();
  const { realm, attributeName } = useParams<AttributeParams>();
  const [attribute, setAttribute] = useState<any>();

  useFetch(
    () => adminClient.users.getProfile({ realm }),
    (config) =>
      setAttribute(
        config.attributes!.find((attribute) => attribute.name === attributeName)
      ),
    []
  );

  const attributeAnnotationsKeys: any[] = [];
  const attributeAnnotationsValues: any[] = [];

  useEffect(() => {
    if (!attribute) {
      return;
    }
    const attributeAnnotations = Object.entries(attribute).map(
      ([key, value]) => ({
        key,
        value,
      })
    );

    attributeAnnotations.forEach((item, index) => {
      attributeAnnotationsKeys.push({
        key: `annotations[${index}].key`,
        value: item.key,
      });

      attributeAnnotationsValues.push({
        key: `annotations[${index}].value`,
        value: item.value,
      });
    });

    attributeAnnotationsKeys.forEach((attribute) =>
      form.setValue(attribute.key, attribute.value)
    );
    attributeAnnotationsValues.forEach((attribute) =>
      form.setValue(attribute.key, attribute.value)
    );
  }, [attribute]);

  return (
    <FormAccess role="manage-realm" isHorizontal>
      <FormGroup
        hasNoPaddingTop
        label={t("annotations")}
        fieldId="kc-annotations"
        className="kc-annotations-label"
      >
        <Grid className="kc-annotations">
          <GridItem>
            <FormProvider {...form}>
              <AttributeInput name="annotations" />
            </FormProvider>
          </GridItem>
        </Grid>
      </FormGroup>
    </FormAccess>
  );
};
