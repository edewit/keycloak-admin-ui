import type PasswordPolicyTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/passwordPolicyTypeRepresentation";

export type SubmittedValues = {
  [index: string]: string;
};

export const toString = (
  policies: PasswordPolicyTypeRepresentation[],
  submitted: SubmittedValues
) => {
  if (!policies.length) {
    return "";
  }
  let policyString = "";
  for (let i = 0; i < policies.length; i++) {
    policyString += policies[i].id + "(" + submitted[policies[i].id!] + ")";
    if (i !== policies.length - 1) {
      policyString += " and ";
    }
  }
  return policyString;
};

type PolicyValue = PasswordPolicyTypeRepresentation & {
  value?: string;
};

export const parsePolicy = (
  policyString: string,
  passwordPolicies: PasswordPolicyTypeRepresentation[]
) => {
  const policies: PolicyValue[] = [];
  if (!policyString || policyString.length == 0) {
    return policies;
  }

  const policyArray = policyString.split(" and ");

  for (let i = 0; i < policyArray.length; i++) {
    const policyToken = policyArray[i];
    let id;
    let value;
    if (!policyToken.includes("(")) {
      id = policyToken.trim();
    } else {
      id = policyToken.substring(0, policyToken.indexOf("("));
      value = policyToken
        .substring(policyToken.indexOf("(") + 1, policyToken.lastIndexOf(")"))
        .trim();
    }

    for (let j = 0; j < passwordPolicies.length; j++) {
      if (passwordPolicies[j].id == id) {
        policies.push({ ...passwordPolicies[j], value });
      }
    }
  }
  return policies;
};
