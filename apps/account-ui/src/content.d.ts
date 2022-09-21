type ContentItem = {
  id: string;
  label: string;
  descriptionLabel?: string;
  labelParams?: string[];
  hidden?: string;
  content?: ContentItem[];
  path?: string;
  componentName?: string;
};
