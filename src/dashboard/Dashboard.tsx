import {
  Brand,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateBody,
  Grid,
  GridItem,
  List,
  ListItem,
  ListVariant,
  PageSection,
  Progress,
  ProgressVariant,
  Split,
  SplitItem,
  Title,
} from "@patternfly/react-core";
import React from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";

import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";

import "./dashboard.css";

const EmptyDashboard = () => {
  const { t } = useTranslation("dashboard");
  const { realm } = useRealm();
  return (
    <PageSection variant="light">
      <EmptyState variant="large">
        <Brand
          src="/icon.svg"
          alt="Keycloak icon"
          className="keycloak__dashboard_icon"
        />
        <Title headingLevel="h4" size="3xl">
          {t("welcome")}
        </Title>
        <Title headingLevel="h4" size="4xl">
          {realm}
        </Title>
        <EmptyStateBody>{t("introduction")}</EmptyStateBody>
      </EmptyState>
    </PageSection>
  );
};

const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  const serverInfo = useServerInfo();

  const enabledFeatures = _.xor(
    serverInfo.profileInfo?.disabledFeatures,
    serverInfo.profileInfo?.experimentalFeatures,
    serverInfo.profileInfo?.previewFeatures
  );

  return (
    <>
      <ViewHeader
        titleKey="dashboard"
        subKey="last refresh"
        subKeyLinkProps={{ title: "refresh", href: "hello" }}
      />
      <PageSection>
        <Split hasGutter>
          <SplitItem isFilled>
            <Grid hasGutter>
              <GridItem span={4}>
                <Card className="keycloak__dashboard_card">
                  <CardTitle>{t("serverInfo")}</CardTitle>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListDescription>
                          {serverInfo.systemInfo?.version}
                        </DescriptionListDescription>
                        <DescriptionListDescription>
                          {serverInfo.profileInfo?.name}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={4}>
                <Card className="keycloak__dashboard_card">
                  <CardTitle>{t("serverTime")}</CardTitle>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListDescription>
                          {serverInfo.systemInfo?.serverTime}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={4}>
                <Card className="keycloak__dashboard_card">
                  <CardTitle>{t("serverUptime")}</CardTitle>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListDescription>
                          {serverInfo.systemInfo?.uptime}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={12}>
                <Card className="keycloak__dashboard_card">
                  <CardTitle>{t("profile")}</CardTitle>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t("enabledFeatures")}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <List variant={ListVariant.inline}>
                            {enabledFeatures.map((feature) => (
                              <ListItem key={feature}>{feature}</ListItem>
                            ))}
                          </List>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t("disabledFeatures")}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <List variant={ListVariant.inline}>
                            {serverInfo.profileInfo?.disabledFeatures?.map(
                              (feature) => (
                                <ListItem key={feature}>{feature}</ListItem>
                              )
                            )}
                          </List>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={12}>
                <Card>
                  <CardTitle>{t("memory")}</CardTitle>
                  <CardBody>
                    <Progress
                      value={100 - serverInfo.memoryInfo?.freePercentage!}
                      variant={
                        serverInfo.memoryInfo?.freePercentage! < 70
                          ? ProgressVariant.warning
                          : ProgressVariant.success
                      }
                    />
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </SplitItem>
          <SplitItem>
            <Card className="keycloak__dashboard_card">
              <CardTitle>{t("system")}</CardTitle>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("currentWorkingDirectory")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.userDir}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("javaVersion")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.javaVersion}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t("javaVendor")}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.javaVendor}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("javaRuntime")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.javaRuntime}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t("javaVm")}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.javaVm}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("javaVmVersion")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.javaVmVersion}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t("javaHome")}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.javaHome}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t("userName")}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.userName}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("userTimezone")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.userTimezone}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t("userLocale")}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.userLocale}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("fileEncoding")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.fileEncoding}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t("osName")}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.osName}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("osArchitecture")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {serverInfo.systemInfo?.osArchitecture}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </SplitItem>
        </Split>
      </PageSection>
    </>
  );
};

export const DashboardSection = () => {
  const { realm } = useRealm();
  const isMasterRealm = realm === "master";
  return (
    <>
      {!isMasterRealm && <EmptyDashboard />}
      {isMasterRealm && <Dashboard />}
    </>
  );
};
