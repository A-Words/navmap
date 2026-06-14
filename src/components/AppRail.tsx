import {
  Clock3,
  Info,
  Layers,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getPanelLabel, translations } from "../i18n";
import type { Language, PanelId } from "../types";

type AppRailProps = {
  active: PanelId;
  language: Language;
  railCollapsed: boolean;
  onSelect: (item: PanelId) => void;
  onToggleRail: () => void;
};

const primaryItems = [
  { id: "search", icon: Search },
  { id: "layers", icon: Layers },
  { id: "route", icon: Route },
] as const;

export function AppRail({ active, language, railCollapsed, onSelect, onToggleRail }: AppRailProps) {
  const copy = translations[language];
  const PanelIcon = railCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className="app-rail" aria-label={copy.nav.primary}>
      <div className="rail-brand">
        <span className="brand-lockup">
          <MapPinned aria-hidden="true" />
          <span>NavMap</span>
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="rail-panel-toggle"
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label={railCollapsed ? copy.nav.expand : copy.nav.collapse}
              onClick={onToggleRail}
            >
              <PanelIcon aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{railCollapsed ? copy.nav.expand : copy.nav.collapse}</TooltipContent>
        </Tooltip>
      </div>

      <nav className="rail-nav">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              className="rail-item"
              data-active={active === item.id}
              variant="ghost"
              type="button"
              onClick={() => onSelect(item.id)}
            >
              <span className="rail-item-icon">
                <Icon data-icon="inline-start" aria-hidden="true" />
              </span>
              <span>{getPanelLabel(language, item.id)}</span>
            </Button>
          );
        })}
      </nav>

      <section className="rail-recents" aria-label={getPanelLabel(language, "recents")}>
        <Button className="rail-section-heading" variant="ghost" type="button" onClick={() => onSelect("recents")}>
          <span>{getPanelLabel(language, "recents")}</span>
          <Clock3 data-icon="inline-end" aria-hidden="true" />
        </Button>
        <Button
          className="rail-recent-item"
          data-active={active === "recents"}
          variant="ghost"
          type="button"
          onClick={() => onSelect("recents")}
        >
          <span className="rail-recent-icon">
            <MapPinned aria-hidden="true" />
          </span>
          <span>{language === "zh" ? "白云机场肇庆候机楼" : "Baiyun Airport Zhaoqing Terminal"}</span>
        </Button>
      </section>

      <div className="rail-footer">
        <Button
          className="rail-icon-item"
          data-active={active === "settings"}
          variant="ghost"
          size="icon"
          type="button"
          aria-label={getPanelLabel(language, "settings")}
          onClick={() => onSelect("settings")}
        >
          <Settings aria-hidden="true" />
        </Button>
        <Button
          className="rail-icon-item"
          data-active={active === "about"}
          variant="ghost"
          size="icon"
          type="button"
          aria-label={getPanelLabel(language, "about")}
          onClick={() => onSelect("about")}
        >
          <Info aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}
