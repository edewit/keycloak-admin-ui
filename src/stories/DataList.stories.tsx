import React from "react";
import { Meta, Story } from "@storybook/react";

import clients from "../clients/__tests__/mock-clients.json";

import { DataList, DataListProps } from "../components/table-toolbar/DataList";
import { IFormatterValueType } from "@patternfly/react-table";

export default {
  title: "Data list",
  component: DataList,
} as Meta;

const Template: Story<DataListProps> = (args) => <DataList {...args} />;

export const SimpleList = Template.bind({});
SimpleList.args = {
  ariaLabelKey: "clients:clientList",
  columns: [
    { name: "clientId", displayKey: "clients:clientID" },
    { name: "protocol", displayKey: "clients:type" },
    {
      name: "description",
      displayKey: "clients:description",
      cellFormatters: [
        (data?: IFormatterValueType) => {
          return data ? data : "—";
        },
      ],
    },
    { name: "baseUrl", displayKey: "clients:homeURL" },
  ],
  data: clients,
};

export const LoadingList = Template.bind({});
LoadingList.args = {
  ariaLabelKey: "clients:clientList",
  columns: [{ name: "title" }, { name: "body" }],
  loader: () => {
    const wait = (ms: number, value: any) =>
      new Promise((resolve) => setTimeout(resolve, ms, value));
    return fetch("https://jsonplaceholder.typicode.com/posts/")
      .then((res) => res.json())
      .then((value) => wait(3000, value) as any);
  },
};
