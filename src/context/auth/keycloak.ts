import Keycloak, { KeycloakInstance } from "keycloak-js";
import mockData from "../../__mocks__/mock-data.json";

const realm =
  new URLSearchParams(window.location.search).get("realm") || "master";

const keycloak: KeycloakInstance = Keycloak({
  url: "http://localhost:8180/auth/",
  realm: realm,
  clientId: "security-admin-console-v2",
});

const { SNOWPACK_PUBLIC_SKIP_BACKEND } = import.meta.env;
export default async function (): Promise<KeycloakInstance> {
  if (SNOWPACK_PUBLIC_SKIP_BACKEND !== "true") {
    await keycloak
      .init({ onLoad: "check-sso", pkceMethod: "S256" })
      .catch(() => {
        alert("failed to initialize keycloak");
      });
    return keycloak;
  } else {
    Object.entries(mockData).forEach((entry) => {
      localStorage.setItem(entry[0], entry[1] as string);
    });
    return Promise.resolve(({
      authServerUrl: "http://localhost:8180/auth",
      tokenParsed: {
        preferred_username: "admin",
      },
      token: "123",
      updateToken: () => Promise.resolve("123"),
      realm: "master",
    } as unknown) as KeycloakInstance);
  }
}
