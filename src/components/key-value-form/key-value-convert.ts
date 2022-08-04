export type KeyValueType = { key: string; value: string };

export const keyValueToArray = (
  attributeArray: KeyValueType[] = []
): Record<string, string[]> =>
  attributeArray
    .filter(({ key }) => key !== "")
    .reduce((obj, item) => {
      if (item.key in obj) {
        obj[item.key].push(item.value);
      } else {
        obj[item.key] = [item.value];
      }
      return obj;
    }, {} as Record<string, string[]>);

export const arrayToKeyValue = (
  attributes: Record<string, string[]> = {}
): KeyValueType[] => {
  const result = Object.entries(attributes).flatMap(([key, value]) =>
    value.map<KeyValueType>((value) => ({ key, value }))
  );

  return result.concat({ key: "", value: "" });
};
