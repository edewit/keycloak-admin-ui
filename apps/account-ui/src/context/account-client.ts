import Keycloak from "keycloak-js";
import environment from "../environment";
import { CredentialContainer, UserRepresentation } from "../representations";

export class AccountClient {
  private kc: Keycloak;

  constructor() {
    this.kc = new Keycloak({
      url: environment.authServerUrl,
      realm: environment.loginRealm,
      clientId: environment.isRunningAsTheme
        ? "account-console"
        : "security-admin-console-v2",
    });
  }

  async init() {
    await this.keycloak.init({ onLoad: "check-sso", pkceMethod: "S256" });
  }

  get keycloak(): Keycloak {
    return this.kc;
  }

  async fetchPersonalInfo(params: RequestInit): Promise<UserRepresentation> {
    return this.doRequest("/", params);
  }

  async savePersonalInfo(info: UserRepresentation): Promise<void> {
    return this.doRequest("/", { body: JSON.stringify(info), method: "post" });
  }

  async fetchCredentials(params: RequestInit): Promise<CredentialContainer[]> {
    return this.doRequest("/credentials", params);
  }

  private async doRequest<T>(path: string, params: RequestInit): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch("/account" + path, {
      ...params,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    return response.json();
  }

  private async getAccessToken() {
    try {
      await this.keycloak.updateToken(5);
    } catch (error) {
      this.keycloak.login();
    }

    return this.keycloak.token;
  }
}
