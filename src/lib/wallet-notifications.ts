export type WalletNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  tone: "info" | "success" | "warning";
};

const storageKey = "qlx-wallet-notifications";
export const walletNotificationsChangedEvent =
  "qlx-wallet-notifications-changed";

export function getWalletNotifications(): WalletNotification[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(value)) return [];

    return value.filter(
      (item): item is WalletNotification =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "title" in item &&
        typeof item.title === "string" &&
        "message" in item &&
        typeof item.message === "string" &&
        "time" in item &&
        typeof item.time === "string" &&
        "read" in item &&
        typeof item.read === "boolean" &&
        "tone" in item &&
        (item.tone === "info" ||
          item.tone === "success" ||
          item.tone === "warning"),
    );
  } catch {
    return [];
  }
}

export function saveWalletNotifications(notifications: WalletNotification[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
    window.dispatchEvent(new Event(walletNotificationsChangedEvent));
  } catch {}
}

export function addWalletNotification(
  notification: Pick<WalletNotification, "title" | "message" | "tone">,
) {
  const next: WalletNotification = {
    ...notification,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: "Just now",
    read: false,
  };
  saveWalletNotifications([next, ...getWalletNotifications()]);
}
