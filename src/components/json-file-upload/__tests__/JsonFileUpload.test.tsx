import React from "react";
import { mount } from "enzyme";

import { JsonFileUpload } from "../JsonFileUpload";
import { waitFor } from "@testing-library/react";
import MutationObserver from "mutation-observer";

describe("<JsonFileUpload />", () => {
  it("render", () => {
    const comp = mount(<JsonFileUpload id="test" onChange={jest.fn()} />);
    expect(comp).toMatchSnapshot();
  });

  it("upload file", async () => {
    const onChange = jest.fn();
    const comp = mount(<JsonFileUpload id="upload" onChange={onChange} />);

    const fileInput = comp.find('[type="file"]');
    expect(fileInput.length).toBe(1);

    const json = '{"bla": "test"}';
    const file = new File([json], "test.json");

    (window as any).MutationObserver = MutationObserver;
    const dummyFileReader = {
      onload: jest.fn(),
      readAsText: () => dummyFileReader.onload(),
      result: json,
    };
    (window as any).FileReader = jest.fn(() => dummyFileReader);

    fileInput.simulate("change", {
      target: {
        files: [file],
      },
    });

    const result = comp.find("textarea").props().value;
    waitFor(() => expect(result).toBe(json));
  });
});
