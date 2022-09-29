import Keycloak from "keycloak-js";
import environment from "../environment";
import {
  ClientRepresentation,
  CredentialContainer,
  CredentialRepresentation,
  DeviceRepresentation,
  Permission,
  Resource,
  Scope,
  UserRepresentation,
} from "../representations";
import parse, { Links } from "./parse-links";

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

  async deleteCredentials(credential: CredentialRepresentation) {
    return this.doRequest("/credentials/" + credential.id, {
      method: "delete",
    });
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

  async fetchApplications(
    params: RequestInit
  ): Promise<ClientRepresentation[]> {
    const response = await this.doRequest<ClientRepresentation[]>(
      "/applications",
      params
    );
    return this.checkResponse(response);
  }

  async deleteConcent(id: string) {
    return this.doRequest(`/applications/${id}/consent`, { method: "delete" });
  }

  async fetchResources(
    params: RequestInit,
    requestParams: Record<string, string>,
    shared: boolean | undefined = false
  ): Promise<{ data: Resource[]; links: Links }> {
    const response = await this.doGet(
      `/resources${shared ? "/shared-with-me?" : "?"}${new URLSearchParams(
        requestParams
      )}`,
      params
    );

    return {
      data: this.checkResponse(await response.json()),
      links: parse(response.headers.get("link")),
    };
  }

  async fetchRequest(
    params: RequestInit,
    resourceId: string,
    pending: boolean | undefined = false
  ): Promise<Permission[]> {
    const response = await this.doRequest<Permission[]>(
      `/resources/${resourceId}/permissions/${
        pending ? "pending-" : ""
      }requests`,
      params
    );

    return this.checkResponse(response);
  }

  async fetchPermission(
    params: RequestInit,
    resourceId: string
  ): Promise<Permission[]> {
    const response = await this.doRequest<Permission[]>(
      `/resources/${resourceId}/permissions`,
      params
    );
    return this.checkResponse(response);
  }

  async updateRequest(
    resourceId: string,
    username: string,
    scopes: Scope[] | string[]
  ) {
    return this.doRequest(`/resources/${resourceId}/permissions`, {
      method: "put",
      body: JSON.stringify([{ username, scopes }]),
    });
  }

  private checkResponse<T>(response: T) {
    if (!response) throw new Error("Could not fetch");
    return response;
  }

  private async doGet(path: string, params: RequestInit) {
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
    return response;
  }

  private async doRequest<T>(
    path: string,
    params: RequestInit
  ): Promise<T | undefined> {
    const response = await this.doGet(path, params);
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
