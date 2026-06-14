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

type AppRailProps = {
  active: "route" | "search" | "recents" | "layers";
  onSelect: (item: AppRailProps["active"]) => void;
};

const navItems = [
  { id: "route", label: "Route", icon: Route },
  { id: "search", label: "Search", icon: Search },
  { id: "recents", label: "Recents", icon: Clock3 },
  { id: "layers", label: "Layers", icon: Layers },
] as const;

export function AppRail({ active, onSelect }: AppRailProps) {
  return (
    <aside className="app-rail" aria-label="Primary navigation">
      <div className="brand">
        <span className="brand-mark">
          <MapPinned size={17} aria-hidden="true" />
        </span>
        <span className="brand-name">NavMap</span>
      </div>
      <button className="collapse-button" type="button" aria-label="Collapse sidebar">
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
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="rail-footer">
        <button className="rail-item" type="button">
          <Settings size={18} aria-hidden="true" />
          <span>Settings</span>
        </button>
        <button className="rail-item" type="button">
          <Info size={18} aria-hidden="true" />
          <span>About</span>
        </button>
      </div>
    </aside>
  );
}

