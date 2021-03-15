import React, { ReactNode } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@patternfly/react-core";

import "./form-panel.css";

type FormPanelProps = {
  title: string;
  scrollId: string;
  children: ReactNode;
};

export const FormPanel = ({ title, children, scrollId }: FormPanelProps) => {
  return (
    <Card isFlat className="kc-form-panel__panel">
      <CardHeader>
        <CardTitle id={scrollId} tabIndex={0}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
};
