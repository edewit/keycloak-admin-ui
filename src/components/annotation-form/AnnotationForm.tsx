import React from "react";
import { useTranslation } from "react-i18next";
import { FormProvider, UseFormMethods } from "react-hook-form";
import type { KeyValueType } from "./annotation-convert";
import { FormAccess } from "../form-access/FormAccess";
import {
  AnnotationInput,
  AnnotationType,
} from "../annotation-input/AnnotationInput";
import { FormGroup, Grid, GridItem } from "@patternfly/react-core";
import "./annotation-form.css";

export type AnnotationForm = {
  annotations?: KeyValueType[];
};

export type AnnotationsFormProps = {
  form: UseFormMethods<AnnotationForm>;
  isKeySelectable?: boolean;
  selectableValues?: AnnotationType[];
  save?: (model: AnnotationForm) => void;
};

export const AnnotationsForm = ({
  form,
  save,
  isKeySelectable,
  selectableValues,
}: AnnotationsFormProps) => {
  const { t } = useTranslation("realm-settings");
  const {
    formState: { isDirty },
  } = form;

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
              <AnnotationInput
                isKeySelectable={isKeySelectable}
                selectableValues={selectableValues}
                name="annotations"
              />
            </FormProvider>
          </GridItem>
        </Grid>
      </FormGroup>
    </FormAccess>
  );
};
