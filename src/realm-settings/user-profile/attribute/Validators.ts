export const validators = [
  {
    name: "double",
    description:
      "Check if the value is a double and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number.",
  },
  {
    name: "email",
    description: "Check if the value has a valid e-mail format.",
  },
  {
    name: "integer",
    description:
      "Check if the value is an integer and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number.",
  },
  {
    name: "length",
    description:
      "Check the length of a string value based on a minimum and maximum length.",
  },
  {
    name: "local-date",
    description:
      "Check if the value has a valid format based on the realm and/or user locale.",
  },
  {
    name: "options",
    description:
      "Check if the value is from the defined set of allowed values. Useful to validate values entered through select and multiselect fields.",
  },
  {
    name: "pattern",
    description: "Check if the value matches a specific RegEx pattern.",
  },
  {
    name: "person-name-prohibited-characters",
    description:
      "Check if the value is a valid person name as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in person names.",
  },
  { name: "uri", description: "Check if the value is a valid URI." },
  {
    name: "username-prohibited-characters",
    description:
      "Check if the value is a valid username as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in usernames.",
  },
];
