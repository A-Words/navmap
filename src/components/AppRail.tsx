import {
  Clock3,
  Compass,
  Info,
  Layers,
  MapPinned,
  Route,
  Search,
  Settings,
} from "lucide-react";
import { getPanelLabel, translations } from "../i18n";
import type { Language } from "../types";

type AppRailProps = {
  active: "route" | "search" | "recents" | "layers" | "settings" | "about";
  language: Language;
  onSelect: (item: AppRailProps["active"]) => void;
};

const navItems = [
  { id: "route", icon: Route },
  { id: "search", icon: Search },
  { id: "recents", icon: Clock3 },
  { id: "layers", icon: Layers },
] as const;

export function AppRail({ active, language, onSelect }: AppRailProps) {
  return (
    <aside className="app-rail" aria-label={translations[language].nav.primary}>
      <div className="brand">
        <span className="brand-mark">
          <MapPinned size={17} aria-hidden="true" />
        </span>
        <span className="brand-name">NavMap</span>
      </div>
      <button className="collapse-button" type="button" aria-label={translations[language].nav.collapse}>
        <Compass size={16} aria-hidden="true" />
      </button>
      <nav className="rail-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`rail-item ${active === item.id ? "is-active" : ""}`}
              type="button"
              onClick={() => onSelect(item.id)}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{getPanelLabel(language, item.id)}</span>
            </button>
          );
        })}
      </nav>
      <div className="rail-footer">
        <button
          className={`rail-item ${active === "settings" ? "is-active" : ""}`}
          type="button"
          onClick={() => onSelect("settings")}
        >
          <Settings size={18} aria-hidden="true" />
          <span>{getPanelLabel(language, "settings")}</span>
        </button>
        <button
          className={`rail-item ${active === "about" ? "is-active" : ""}`}
          type="button"
          onClick={() => onSelect("about")}
        >
          <Info size={18} aria-hidden="true" />
          <span>{getPanelLabel(language, "about")}</span>
        </button>
      </div>
    </aside>
  );
}
