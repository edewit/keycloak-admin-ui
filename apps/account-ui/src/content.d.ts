type ContentItem = {
  id: string;
  label: string;
  labelParams?: string[];
  hidden?: string;
  groupId: string; // computed value
  content?: ContentItem[];
  path?: string;
  componentName?: string;
};
