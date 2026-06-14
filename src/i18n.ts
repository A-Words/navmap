import type { Language, LayerId, PanelId, TravelMode } from "./types";

export const DEFAULT_LANGUAGE: Language = "zh";

export const LANGUAGES: Array<{ id: Language; label: string; shortLabel: string }> = [
  { id: "zh", label: "中文", shortLabel: "中" },
  { id: "en", label: "English", shortLabel: "EN" },
];

export const translations = {
  zh: {
    nav: {
      route: "路线",
      search: "搜索",
      recents: "最近",
      layers: "图层",
      settings: "设置",
      about: "关于",
      collapse: "收起侧边栏",
      expand: "展开侧边栏",
      primary: "主导航",
    },
    panel: {
      routePlanning: "路线规划",
      searchTitle: "搜索",
      searchDescription: "查找地点、地址和坐标。",
      recentsTitle: "最近",
      recentsDescription: "回到本次会话中使用过的地点。",
      layersTitle: "图层",
      layersDescription: "不离开路线视图，也能调整地图样式。",
      settingsTitle: "设置",
      settingsDescription: "在本地保存的桌面偏好。",
      aboutTitle: "关于",
      aboutDescription: "由 OpenStreetMap 驱动的桌面导航。",
      share: "共享",
    },
    route: {
      addWaypoint: "添加途经点",
      options: "选项",
      hideOptions: "收起选项",
      waypoint: "途经点",
      removeWaypoint: "移除途经点",
      routeOptions: "路线选项",
      departure: "出发时间",
      departNow: "现在",
      avoidHighways: "避开高速",
      avoidTolls: "避开收费",
      avoidFerries: "避开轮渡",
      routeOptionHint: "这些偏好会随本次路线面板保留，后续可接入自托管路线服务。",
      useSearchResult: "选择搜索结果后会更新当前编辑的路线点。",
      go: "开始",
      routing: "规划中",
      details: "详情",
      fastest: "最快路线，常规交通",
      stepByStep: "逐步导航",
      searchResults: "搜索结果",
      recentSearches: "最近搜索",
      recentPlaces: "最近地点",
      places: "地点",
      more: "更多",
      clear: "清除",
      noPlaces: "未找到地点。试试更宽泛的关键词。",
      searchFailed: "搜索失败",
      routeFailed: "路线规划失败",
      locationDenied: "定位权限被拒绝或不可用",
      routeReady: "沿高亮路线行驶",
      routeDescriptionFallback: "路线",
      via: "经由",
    },
    search: {
      inputPlaceholder: "搜索附近地点",
      submit: "搜索",
      searching: "搜索中",
    },
    layers: {
      baseMap: "底图",
      standard: "标准",
      terrain: "地形",
      transit: "交通",
      visibleOverlays: "可见叠加层",
      activeRoute: "当前路线",
      activeRouteDescription: "蓝色路线覆盖层和 A/B 标记",
      scaleAttribution: "比例尺和署名",
      scaleAttributionDescription: "OSM 署名和公制比例尺",
      on: "开启",
      open: "打开图层",
      layersHint: "切换底图时会保留当前路线和搜索状态。",
    },
    settings: {
      defaultLayer: "默认图层",
      recentSearches: "最近搜索",
      savedLocally: "条本地保存",
      location: "定位",
      locationDescription: "使用系统浏览器定位权限",
      ask: "询问",
      auto: "自动",
      language: "语言",
      languageDescription: "界面语言会自动保存",
      appearance: "外观",
      appearanceDescription: "选择主题，或跟随系统设置",
      themeSystem: "跟随系统",
      themeLight: "亮色",
      themeDark: "深色",
    },
    about: {
      body: "NavMap 将 OpenStreetMap 地图、地点搜索和路线规划整合成清爽的桌面导航体验。",
      mapData: "地图数据",
      version: "版本",
      attribution: "© OpenStreetMap 贡献者",
    },
    map: {
      interactive: "交互式地图",
      controls: "地图控件",
      zoomControls: "缩放控件",
      zoomIn: "放大",
      zoomOut: "缩小",
      resetCompass: "重置指南针",
      currentLocation: "前往当前位置",
      recenterRoute: "重新居中路线",
      online: "在线",
      mapData: "地图数据 © OpenStreetMap 贡献者",
      centered: "地图中心",
      ready: "地图就绪",
    },
    modes: {
      driving: "驾车",
      walking: "步行",
      cycling: "骑行",
    },
    routeFields: {
      reorder: "调整路线顺序",
      swap: "交换起终点",
      origin: "起点",
      destination: "终点",
    },
    routeSteps: {
      start: "出发",
      arrive: "到达",
      startOn: "从 {road} 出发",
      turn: "转向",
      merge: "汇入",
      onRamp: "进入匝道",
      depart: "出发",
      continue: "继续",
      left: "左转",
      right: "右转",
      slightLeft: "稍向左转",
      slightRight: "稍向右转",
      sharpLeft: "急左转",
      sharpRight: "急右转",
      straight: "直行",
      onto: "至",
    },
    units: {
      meters: "米",
      kilometers: "公里",
      minutes: "分钟",
      hours: "小时",
    },
  },
  en: {
    nav: {
      route: "Route",
      search: "Search",
      recents: "Recents",
      layers: "Layers",
      settings: "Settings",
      about: "About",
      collapse: "Collapse sidebar",
      expand: "Expand sidebar",
      primary: "Primary navigation",
    },
    panel: {
      routePlanning: "Route planning",
      searchTitle: "Search",
      searchDescription: "Find places, addresses, and coordinates.",
      recentsTitle: "Recents",
      recentsDescription: "Return to the places used in this session.",
      layersTitle: "Layers",
      layersDescription: "Tune the map style without leaving the route view.",
      settingsTitle: "Settings",
      settingsDescription: "Desktop preferences saved locally.",
      aboutTitle: "About",
      aboutDescription: "OpenStreetMap-powered desktop navigation.",
      share: "Share",
    },
    route: {
      addWaypoint: "Add Waypoint",
      options: "Options",
      hideOptions: "Hide Options",
      waypoint: "Waypoint",
      removeWaypoint: "Remove waypoint",
      routeOptions: "Route options",
      departure: "Departure time",
      departNow: "Now",
      avoidHighways: "Avoid highways",
      avoidTolls: "Avoid tolls",
      avoidFerries: "Avoid ferries",
      routeOptionHint: "These preferences stay in this route panel and can later connect to a self-hosted routing service.",
      useSearchResult: "Selecting a search result updates the route point being edited.",
      go: "Go",
      routing: "Routing",
      details: "Details",
      fastest: "Fastest route, typical traffic",
      stepByStep: "Step-by-step",
      searchResults: "Search Results",
      recentSearches: "Recent Searches",
      recentPlaces: "Recent Places",
      places: "Places",
      more: "More",
      clear: "Clear",
      noPlaces: "No places found. Try a broader search.",
      searchFailed: "Search failed",
      routeFailed: "Route planning failed",
      locationDenied: "Location permission was denied or is unavailable",
      routeReady: "Follow the highlighted route",
      routeDescriptionFallback: "route",
      via: "via",
    },
    search: {
      inputPlaceholder: "Search nearby places",
      submit: "Search",
      searching: "Searching",
    },
    layers: {
      baseMap: "Base map",
      standard: "Standard",
      terrain: "Terrain",
      transit: "Transit",
      visibleOverlays: "Visible overlays",
      activeRoute: "Active route",
      activeRouteDescription: "Blue route overlay and A/B markers",
      scaleAttribution: "Scale and attribution",
      scaleAttributionDescription: "OSM attribution and metric scale bar",
      on: "On",
      open: "Open layers",
      layersHint: "Switching base maps keeps the current route and search state.",
    },
    settings: {
      defaultLayer: "Default layer",
      recentSearches: "Recent searches",
      savedLocally: "saved locally",
      location: "Location",
      locationDescription: "Uses system browser geolocation permission",
      ask: "Ask",
      auto: "Auto",
      language: "Language",
      languageDescription: "Interface language is saved automatically",
      appearance: "Appearance",
      appearanceDescription: "Choose a theme or follow the system setting",
      themeSystem: "System",
      themeLight: "Light",
      themeDark: "Dark",
    },
    about: {
      body: "NavMap combines OpenStreetMap maps, place search, and route planning into a clean desktop navigation experience.",
      mapData: "Map data",
      version: "Version",
      attribution: "© OpenStreetMap contributors",
    },
    map: {
      interactive: "Interactive map",
      controls: "Map controls",
      zoomControls: "Zoom controls",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      resetCompass: "Reset compass",
      currentLocation: "Go to current location",
      recenterRoute: "Recenter route",
      online: "Online",
      mapData: "Map data © OpenStreetMap contributors",
      centered: "Map centered",
      ready: "Map ready",
    },
    modes: {
      driving: "Driving",
      walking: "Walking",
      cycling: "Cycling",
    },
    routeFields: {
      reorder: "Reorder route",
      swap: "Swap origin and destination",
      origin: "Origin",
      destination: "Destination",
    },
    routeSteps: {
      start: "Start",
      arrive: "Arrive",
      startOn: "Start on {road}",
      turn: "Turn",
      merge: "Merge",
      onRamp: "Use the ramp",
      depart: "Depart",
      continue: "Continue",
      left: "left",
      right: "right",
      slightLeft: "slight left",
      slightRight: "slight right",
      sharpLeft: "sharp left",
      sharpRight: "sharp right",
      straight: "straight",
      onto: "onto",
    },
    units: {
      meters: "m",
      kilometers: "km",
      minutes: "min",
      hours: "hr",
    },
  },
} as const;

export type Translation = (typeof translations)[Language];

export function getPanelLabel(language: Language, panel: PanelId) {
  return translations[language].nav[panel];
}

export function getLayerLabel(language: Language, layer: LayerId) {
  return translations[language].layers[layer];
}

export function getModeLabel(language: Language, mode: TravelMode) {
  return translations[language].modes[mode];
}

export function formatDistanceLabel(meters: number, language: Language) {
  const units = translations[language].units;
  if (meters < 1000) {
    return language === "zh" ? `${Math.round(meters / 10) * 10} ${units.meters}` : `${Math.round(meters / 10) * 10} ${units.meters}`;
  }

  return language === "zh"
    ? `${(meters / 1000).toFixed(1)} ${units.kilometers}`
    : `${(meters / 1000).toFixed(1)} ${units.kilometers}`;
}

export function formatDurationLabel(seconds: number, language: Language) {
  const units = translations[language].units;
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} ${units.minutes}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!remainingMinutes) {
    return `${hours} ${units.hours}`;
  }

  return language === "zh"
    ? `${hours} ${units.hours} ${remainingMinutes} ${units.minutes}`
    : `${hours} ${units.hours} ${remainingMinutes} ${units.minutes}`;
}
