import type { RoutePlan, SearchResult } from "../types";

export const seedOrigin: SearchResult = {
  id: "my-location",
  name: "My Location",
  address: "7th Street, San Francisco, CA",
  coordinate: { lng: -122.3957, lat: 37.7666 },
  type: "location",
};

export const seedDestination: SearchResult = {
  id: "union-square",
  name: "Union Square",
  address: "San Francisco, CA 94108, USA",
  distanceLabel: "7.4 km",
  coordinate: { lng: -122.4075, lat: 37.788 },
  type: "square",
};

export const seedSearchResults: SearchResult[] = [
  seedDestination,
  {
    id: "union-square-park",
    name: "Union Square Park",
    address: "333 Post St, San Francisco, CA 94108, USA",
    distanceLabel: "7.3 km",
    coordinate: { lng: -122.4077, lat: 37.7879 },
    type: "park",
  },
  {
    id: "union-square-garage",
    name: "Union Square Garage",
    address: "333 Post St, San Francisco, CA 94108, USA",
    distanceLabel: "7.2 km",
    coordinate: { lng: -122.4083, lat: 37.7885 },
    type: "parking",
  },
];

export const seedRecentSearches: SearchResult[] = [
  {
    id: "ferry-building",
    name: "Ferry Building",
    address: "1 Ferry Building, San Francisco, CA",
    coordinate: { lng: -122.3937, lat: 37.7955 },
    type: "landmark",
  },
  {
    id: "golden-gate-bridge",
    name: "Golden Gate Bridge",
    address: "Golden Gate Bridge, San Francisco, CA",
    coordinate: { lng: -122.4783, lat: 37.8199 },
    type: "bridge",
  },
];

export const seedRoutePlan: RoutePlan = {
  origin: seedOrigin,
  destination: seedDestination,
  mode: "driving",
  route: {
    distanceLabel: "7.4 km",
    durationLabel: "18 min",
    description: "via US-101 S and I-80 E",
    geometry: [
      seedOrigin.coordinate,
      { lng: -122.3959, lat: 37.7724 },
      { lng: -122.3993, lat: 37.7776 },
      { lng: -122.4038, lat: 37.7812 },
      { lng: -122.4054, lat: 37.785 },
      seedDestination.coordinate,
    ],
    instructions: [
      {
        id: "start",
        icon: "start",
        title: "Start",
        subtitle: "My Location",
        distanceLabel: "0 m",
      },
      {
        id: "straight-7th",
        icon: "straight",
        title: "Head northeast on 7th St",
        distanceLabel: "450 m",
      },
      {
        id: "right-brannan",
        icon: "right",
        title: "Turn right onto Brannan St",
        distanceLabel: "600 m",
      },
      {
        id: "left-king",
        icon: "left",
        title: "Turn left onto King St",
        distanceLabel: "1.2 km",
      },
      {
        id: "merge-101",
        icon: "merge",
        title: "Use the ramp to merge onto US-101 S",
        distanceLabel: "2.9 km",
      },
      {
        id: "highway-80",
        icon: "highway",
        title: "Keep right to continue on I-80 E",
        distanceLabel: "2.8 km",
      },
      {
        id: "exit-2c",
        icon: "right",
        title: "Take exit 2C toward 7th St",
        distanceLabel: "350 m",
      },
      {
        id: "arrive",
        icon: "arrive",
        title: "Arrive",
        subtitle: "Union Square, San Francisco, CA",
        distanceLabel: "--",
      },
    ],
  },
};

