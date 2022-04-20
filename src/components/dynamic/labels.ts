export default {
  dynamic: {
    addMultivaluedLabel: "Add {{fieldLabel}}",
    selectARole: "Select a role",
    selectASourceOfRoles: "Select a source of roles",
    clientRoles: "Client roles",
    roleGroup: "Use a realm role from:",
    clientGroup: "Use a client role from:",
    selectGroup: "Select group",
    "loa-condition-level": "Level of Authentication (LoA)",
    "loa-condition-level.tooltip":
      "The number value, usually 1 or bigger, which specifies level of authentication. Condition evaluates to true if user does not yet have this authentication level and this level is requested. This level of authentication will be set to the session after the subflow, where this condition is configured, is successfully finished.",
    "loa-max-age": "Max Age",
    "loa-max-age.tooltip":
      "Maximum age in seconds for which this level is considered valid after successful authentication. For example if this is set to 300 and user authenticated with this level and then tries to authenticate again in less than 300 second, then this level will be automatically considered as authenticated without need of user to re-authenticate. If it is set to 0, then the authenticated level is valid just for this authentication and next authentication will always need to re-authenticate. Default value is 10 hours, which is same as default SSO session timeout and it means that level is valid until end of SSO session and user doesn't need to re-authenticate.",
    usermodel: {
      prop: {
        label: "Property",
        tooltip:
          "Name of the property method in the UserModel interface. For example, a value of 'email' would reference the UserModel.getEmail() method.",
      },
      attr: {
        label: "User Attribute",
        tooltip:
          "Name of stored user attribute which is the name of an attribute within the UserModel.attribute map.",
      },
      clientRoleMapping: {
        clientId: {
          label: "Client ID",
          tooltip:
            "Client ID for role mappings. Just client roles of this client will be added to the token. If this is unset, client roles of all clients will be added to the token.",
        },
        rolePrefix: {
          label: "Client Role prefix",
          tooltip: "A prefix for each client role (optional).",
        },
        tokenClaimName: {
          tooltip:
            "Name of the claim to insert into the token. This can be a fully qualified name like 'address.street'. In this case, a nested json object will be created. To prevent nesting and use dot literally, escape the dot with backslash (\\.). The special token ${client_id} can be used and this will be replaced by the actual client ID. Example usage is 'resource_access.${client_id}.roles'. This is useful especially when you are adding roles from all the clients (Hence 'Client ID' switch is unset) and you want client roles of each client stored separately.",
        },
      },
      realmRoleMapping: {
        rolePrefix: {
          label: "Realm Role prefix",
          tooltip: "A prefix for each Realm Role (optional).",
        },
      },
    },
    userSession: {
      modelNote: {
        label: "User Session Note",
        tooltip:
          "Name of stored user session note within the UserSessionModel.note map.",
      },
    },
    multivalued: {
      label: "Multivalued",
      tooltip:
        "Indicates if attribute supports multiple values. If true, the list of all values of this attribute will be set as claim. If false, just first value will be set as claim",
    },
    aggregate: {
      attrs: {
        label: "Aggregate attribute values",
        tooltip:
          "Indicates if attribute values should be aggregated with the group attributes. If using OpenID Connect mapper the multivalued option needs to be enabled too in order to get all the values. Duplicated values are discarded and the order of values is not guaranteed with this option.",
      },
    },
    selectRole: {
      label: "Select Role",
      tooltip:
        "Enter role in the textbox to the left, or click this button to browse and select the role you want.",
    },
    tokenClaimName: {
      label: "Token Claim Name",
      tooltip:
        "Name of the claim to insert into the token. This can be a fully qualified name like 'address.street'. In this case, a nested json object will be created. To prevent nesting and use dot literally, escape the dot with backslash (\\.).",
    },
    jsonType: {
      label: "Claim JSON Type",
      tooltip:
        "JSON type that should be used to populate the json claim in the token. long, int, boolean, String and JSON are valid values.",
    },
    includeInIdToken: {
      label: "Add to ID token",
      tooltip: "Should the claim be added to the ID token?",
    },
    includeInAccessToken: {
      label: "Add to access token",
      tooltip: "Should the claim be added to the access token?",
    },
    includeInAccessTokenResponse: {
      label: "Add to access token response",
      tooltip:
        "Should the claim be added to the access token response? Should only be used for informative and non-sensitive data",
    },
    includeInUserInfo: {
      label: "Add to userinfo",
      tooltip: "Should the claim be added to the userinfo?",
    },
    sectorIdentifierUri: {
      label: "Sector Identifier URI",
      tooltip:
        "Providers that use pairwise sub values and support Dynamic Client Registration SHOULD use the sector_identifier_uri parameter. It provides a way for a group of websites under common administrative control to have consistent pairwise sub values independent of the individual domain names. It also provides a way for Clients to change redirect_uri domains without having to reregister all their users.",
    },
    pairwiseSubAlgorithmSalt: {
      label: "Salt",
      tooltip:
        "Salt used when calculating the pairwise subject identifier. If left blank, a salt will be generated.",
    },
    addressClaim: {
      street: {
        label: "User Attribute Name for Street",
        tooltip:
          "Name of User Attribute, which will be used to map to 'street_address' subclaim inside 'address' token claim. Defaults to 'street' .",
      },
      locality: {
        label: "User Attribute Name for Locality",
        tooltip:
          "Name of User Attribute, which will be used to map to 'locality' subclaim inside 'address' token claim. Defaults to 'locality' .",
      },
      region: {
        label: "User Attribute Name for Region",
        tooltip:
          "Name of User Attribute, which will be used to map to 'region' subclaim inside 'address' token claim. Defaults to 'region' .",
      },
      postal_code: {
        label: "User Attribute Name for Postal Code",
        tooltip:
          "Name of User Attribute, which will be used to map to 'postal_code' subclaim inside 'address' token claim. Defaults to 'postal_code' .",
      },
      country: {
        label: "User Attribute Name for Country",
        tooltip:
          "Name of User Attribute, which will be used to map to 'country' subclaim inside 'address' token claim. Defaults to 'country' .",
      },
      formatted: {
        label: "User Attribute Name for Formatted Address",
        tooltip:
          "Name of User Attribute, which will be used to map to 'formatted' subclaim inside 'address' token claim. Defaults to 'formatted' .",
      },
    },
    included: {
      client: {
        audience: {
          label: "Included Client Audience",
          tooltip:
            "The Client ID of the specified audience client will be included in audience (aud) field of the token. If there are existing audiences in the token, the specified value is just added to them. It won't override existing audiences.",
        },
      },
      custom: {
        audience: {
          label: "Included Custom Audience",
          tooltip:
            "This is used just if 'Included Client Audience' is not filled. The specified value will be included in audience (aud) field of the token. If there are existing audiences in the token, the specified value is just added to them. It won't override existing audiences.",
        },
      },
    },
    "name-id-format": "Name ID Format",
    mapper: {
      nameid: {
        format: {
          tooltip: "Name ID Format using Mapper",
        },
      },
    },

    "client-scopes-condition": {
      label: "Expected Scopes",
      tooltip:
        "The list of expected client scopes. Condition evaluates to true if specified client request matches some of the client scopes. It depends also whether it should be default or optional client scope based on the 'Scope Type' configured.",
    },
    "client-accesstype": {
      label: "Client Access Type",
      tooltip:
        "Access Type of the client, for which the condition will be applied.",
    },
    "client-roles": {
      label: "Client Roles",
    },
    "client-roles-condition": {
      tooltip:
        "Client roles, which will be checked during this condition evaluation. Condition evaluates to true if client has at least one client role with the name as the client roles specified in the configuration.",
    },
    "client-updater-source-groups": {
      label: "Groups",
      tooltip:
        "Name of groups to check. Condition evaluates to true if the entity, who creates/updates client is member of some of the specified groups. Configured groups are specified by their simple name, which must match to the name of the Keycloak group. No support for group hierarchy is used here.",
    },
    "client-updater-trusted-hosts": {
      label: "Trusted hosts",
      tooltip:
        "List of Hosts, which are trusted. In case that client registration/update request comes from the host/domain specified in this configuration, condition evaluates to true. You can use hostnames or IP addresses. If you use star at the beginning (for example '*.example.com' ) then whole domain example.com will be trusted.",
    },
    "client-updater-source-roles": {
      label: "Updating entity role",
      tooltip:
        "The condition is checked during client registration/update requests and it evaluates to true if the entity (usually user), who is creating/updating client is member of the specified role. For reference the realm role, you can use the realm role name like 'my_realm_role' . For reference client role, you can use the client_id.role_name for example 'my_client.my_client_role' will refer to client role 'my_client_role' of client 'my_client'.",
    },
  },
};
