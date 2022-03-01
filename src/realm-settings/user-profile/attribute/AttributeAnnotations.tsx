import React, { useState } from "react";
import "../../realm-settings-section.css";
import { useForm } from "react-hook-form";
import {
  AnnotationForm,
  AnnotationsForm,
} from "../../../components/annotation-form/AnnotationForm";
import { arrayToAnnotations } from "../../../components/annotation-form/annotation-convert";

type AttributeAnnotationsProps = {
  annotations: Record<string, unknown>;
};

export const AttributeAnnotations = ({
  annotations: defaultAnnotations,
}: AttributeAnnotationsProps) => {
  const [annotations, setAnnotations] =
    useState<Record<string, unknown>>(defaultAnnotations);
  const form = useForm<AnnotationForm>({ mode: "onChange" });

  const save = async (annotationForm: AnnotationForm) => {
    const annotations = arrayToAnnotations(annotationForm.annotations!);
    setAnnotations({ ...annotations, annotations });
  };

  return <AnnotationsForm form={form} save={save} />;
};
