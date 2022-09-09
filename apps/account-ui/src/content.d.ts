type ContentItem = {
  id?: string;
  label: string;
  labelParams?: string[];
  hidden?: string;
  groupId: string; // computed value
  itemId: string; // computed value
  content?: ContentItem[];
  path?: string;
};

type ModulePageDef = PageDef & {
  modulePath: string;
  componentName: string;
  module: React.Component; // computed value
};
