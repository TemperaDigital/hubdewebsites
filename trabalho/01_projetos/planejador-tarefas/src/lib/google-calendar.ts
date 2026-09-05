/* eslint-disable @typescript-eslint/no-explicit-any */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient: any = null;
let accessToken: string | null = null;
let gapiLoaded = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function ensureGapi() {
  if (gapiLoaded) return;
  await loadScript("https://apis.google.com/js/api.js");
  await new Promise<void>((resolve) => (window as any).gapi.load("client", resolve));
  await (window as any).gapi.client.init({
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
  });
  gapiLoaded = true;
}

export function isGoogleConfigured() {
  return Boolean(CLIENT_ID);
}

export function isConnected() {
  return Boolean(accessToken);
}

export async function connectGoogle(): Promise<void> {
  if (!CLIENT_ID) throw new Error("VITE_GOOGLE_CLIENT_ID não configurado");
  await loadScript("https://accounts.google.com/gsi/client");
  await ensureGapi();
  return new Promise((resolve, reject) => {
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error) return reject(new Error(resp.error));
        accessToken = resp.access_token;
        (window as any).gapi.client.setToken({ access_token: accessToken });
        resolve();
      },
    });
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export function disconnectGoogle() {
  if (accessToken && (window as any).google?.accounts?.oauth2) {
    (window as any).google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  if ((window as any).gapi?.client) (window as any).gapi.client.setToken(null);
}

export async function createEvent(input: {
  summary: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
}): Promise<string> {
  if (!accessToken) throw new Error("Conecte-se ao Google primeiro");
  const resp = await (window as any).gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start },
      end: { dateTime: input.end },
    },
  });
  return resp.result.id as string;
}

export async function deleteEvent(eventId: string) {
  if (!accessToken) return;
  await (window as any).gapi.client.calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}