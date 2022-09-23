import Keycloak from "keycloak-js";
import environment from "../environment";
import {
  CredentialContainer,
  CredentialRepresentation,
  DeviceRepresentation,
  UserRepresentation,
} from "../representations";

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
    const response = await this.doRequest<UserRepresentation>("/", params);
    return this.checkResponse(response);
  }

  async savePersonalInfo(info: UserRepresentation) {
    return this.doRequest("/", { body: JSON.stringify(info), method: "post" });
  }

  async fetchCredentials(params: RequestInit): Promise<CredentialContainer[]> {
    const response = await this.doRequest<CredentialContainer[]>(
      "/credentials",
      params
    );
    return this.checkResponse(response);
  }

  async fetchDevices(params: RequestInit): Promise<DeviceRepresentation[]> {
    const response = await this.doRequest<DeviceRepresentation[]>(
      "/sessions/devices",
      params
    );
    return this.checkResponse(response);
  }

  async deleteSession(id?: string) {
    return this.doRequest(`"/sessions${id ? `/${id}` : ""}`, {
      method: "delete",
    });
  }

  private checkResponse<T>(response: T) {
    if (!response) throw new Error("Could not fetch");
    return response;
  }

  async deleteCredentials(credential: CredentialRepresentation) {
    return this.doRequest("/credentials/" + credential.id, {
      method: "delete",
    });
  }

  private async doRequest<T>(
    path: string,
    params: RequestInit
  ): Promise<T | undefined> {
    const token = await this.getAccessToken();
    const response = await fetch("/account" + path, {
      ...params,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (response.status !== 204) return response.json();
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
