import {
  Clock3,
  Info,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Search,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PanelId } from "../types";

type AppRailProps = {
  active: PanelId;
  railCollapsed: boolean;
  onSelect: (item: PanelId) => void;
  onToggleRail: () => void;
};

const primaryItems = [
  { id: "search", icon: Search },
  { id: "route", icon: Route },
] as const;

export function AppRail({ active, railCollapsed, onSelect, onToggleRail }: AppRailProps) {
  const { t } = useTranslation();
  const PanelIcon = railCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className="app-rail" aria-label={t("nav.primary")}>
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
              aria-label={railCollapsed ? t("nav.expand") : t("nav.collapse")}
              onClick={onToggleRail}
            >
              <PanelIcon aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{railCollapsed ? t("nav.expand") : t("nav.collapse")}</TooltipContent>
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
              <span>{t(`nav.${item.id}`)}</span>
            </Button>
          );
        })}
      </nav>

      <section className="rail-recents" aria-label={t("nav.recents")}>
        <Button className="rail-section-heading" variant="ghost" type="button" onClick={() => onSelect("recents")}>
          <span>{t("nav.recents")}</span>
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
          <span>{t("seed.recentsItem")}</span>
        </Button>
      </section>

      <div className="rail-footer">
        <Button
          className="rail-icon-item"
          data-active={active === "settings"}
          variant="ghost"
          size="icon"
          type="button"
          aria-label={t("nav.settings")}
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
          aria-label={t("nav.about")}
          onClick={() => onSelect("about")}
        >
          <Info aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}
