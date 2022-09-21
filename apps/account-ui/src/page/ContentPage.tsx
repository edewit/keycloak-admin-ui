import { ReactNode } from "react";
import { TextContent, Text, Title } from "@patternfly/react-core";
import { useTranslation } from "react-i18next";

type ContentPageProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const ContentPage = ({
  title,
  description,
  children,
}: ContentPageProps) => {
  const { t } = useTranslation();
  return (
    <>
      <TextContent className="pf-u-mb-xl">
        <Title headingLevel="h1" size="2xl" className="pf-u-mb-xl">
          {t(title)}
        </Title>
        {description && <Text component="p">{t(description)}</Text>}
      </TextContent>
      {children}
    </>
  );
};
