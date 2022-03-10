export const validators = [
  {
    name: "double",
    description:
      "Check if the value is a double and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number.",
    properties: [
      {
        type: "String",
        defaultValue: "",
        helpText: "The minimal allowed value - this config is optional.",
        label: "Minimum",
        name: "minimum",
      },
      {
        type: "String",
        defaultValue: "",
        helpText: "The maximal allowed value - this config is optional.",
        label: "Maximum",
        name: "maximum",
      },
    ],
  },
  {
    name: "email",
    description: "Check if the value has a valid e-mail format.",
    properties: [],
  },
  {
    name: "integer",
    description:
      "Check if the value is an integer and within a lower and/or upper range. If no range is defined, the validator only checks whether the value is a valid number.",
    properties: [
      {
        type: "String",
        defaultValue: "",
        helpText: "The minimal allowed value - this config is optional.",
        label: "Minimum",
        name: "minimum",
      },
      {
        type: "String",
        defaultValue: "",
        helpText: "The maximal allowed value - this config is optional.",
        label: "Maximum",
        name: "maximum",
      },
    ],
  },
  {
    name: "length",
    description:
      "Check the length of a string value based on a minimum and maximum length.",
    properties: [
      {
        type: "String",
        defaultValue: "The minimum length",
        helpText: "",
        label: "Minimum length",
        name: "minimumLength",
      },
      {
        type: "String",
        defaultValue: "",
        helpText: "The maximum length",
        label: "Maximum length",
        name: "maximumLength",
      },
      {
        type: "boolean",
        defaultValue: false,
        helpText:
          "Disable trimming of the String value before the length check",
        label: "Trimming disabled",
        name: "trimmingDisabled",
      },
    ],
  },
  {
    name: "local-date",
    description:
      "Check if the value has a valid format based on the realm and/or user locale.",
    properties: [],
  },
  {
    name: "options",
    description:
      "Check if the value is from the defined set of allowed values. Useful to validate values entered through select and multiselect fields.",
    properties: [
      {
        type: "MultivaluedString",
        defaultValue: "",
        helpText: "List of allowed options",
        label: "Options",
        name: "options",
      },
    ],
  },
  {
    name: "pattern",
    description: "Check if the value matches a specific RegEx pattern.",
    properties: [
      {
        type: "String",
        defaultValue: "",
        helpText:
          "RegExp pattern the value must match. Java Pattern syntax is used.",
        label: "RegExp pattern",
        name: "regExpPattern",
      },
      {
        type: "String",
        defaultValue: "",
        helpText:
          "Key of the error message in i18n bundle. Dafault message key is error-pattern-no-match",
        label: "Error message key",
        name: "errorMessageKey",
      },
    ],
  },
  {
    name: "person-name-prohibited-characters",
    description:
      "Check if the value is a valid person name as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in person names.",
    properties: [
      {
        type: "String",
        defaultValue: "",
        helpText:
          "Key of the error message in i18n bundle. Dafault message key is error-person-name-invalid-character",
        label: "Error message key",
        name: "errorMessageKey",
      },
    ],
  },
  {
    name: "uri",
    description: "Check if the value is a valid URI.",
    properties: [],
  },
  {
    name: "username-prohibited-characters",
    description:
      "Check if the value is a valid username as an additional barrier for attacks such as script injection. The validation is based on a default RegEx pattern that blocks characters not common in usernames.",
    properties: [
      {
        type: "String",
        defaultValue: "",
        helpText:
          "Key of the error message in i18n bundle. Dafault message key is error-username-invalid-character",
        label: "Error message key",
        name: "errorMessageKey",
      },
    ],
  },
];
