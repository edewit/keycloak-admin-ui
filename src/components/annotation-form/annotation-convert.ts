export type KeyValueType = { key: string; value: string };

export const arrayToAnnotations = (
  annotationArray: KeyValueType[] = []
): Record<string, string[]> =>
  Object.fromEntries(
    annotationArray
      .filter(({ key }) => key !== "")
      .map(({ key, value }) => [key, [value]])
  );

export const annotationsToArray = (
  annotations: Record<string, string[]> = {}
): KeyValueType[] => {
  const result = Object.entries(annotations).flatMap(([key, value]) =>
    value.map<KeyValueType>((value) => ({ key, value }))
  );

  return result.concat({ key: "", value: "" });
};
