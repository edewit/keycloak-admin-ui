import React, { useEffect } from "react";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router-dom";

import { GroupBreadCrumbs } from "../GroupBreadCrumbs";
import { SubGroups, useSubGroups } from "../../../groups/GroupsSection";

const GroupCrumbs = () => {
  const { addSubGroup } = useSubGroups();
  useEffect(() => {
    addSubGroup({ id: "123", name: "active group" });
  }, []);

  return <GroupBreadCrumbs />;
};

describe("Group BreadCrumbs tests", () => {
  it("couple of crumbs", () => {
    const crumbs = mount(
      <MemoryRouter initialEntries={["/groups"]}>
        <SubGroups>
          <GroupCrumbs />
        </SubGroups>
      </MemoryRouter>
    );

    expect(crumbs.find(GroupCrumbs)).toMatchSnapshot();
  });
});
