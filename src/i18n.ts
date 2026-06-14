import i18next from "./i18n/index";

const t = (key: string) => i18next.t(key);

export function formatDistanceLabel(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters / 10) * 10} ${t("units.meters")}`;
  }

  return `${(meters / 1000).toFixed(1)} ${t("units.kilometers")}`;
}

export function formatDurationLabel(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} ${t("units.minutes")}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!remainingMinutes) {
    return `${hours} ${t("units.hours")}`;
  }

  return `${hours} ${t("units.hours")} ${remainingMinutes} ${t("units.minutes")}`;
}
