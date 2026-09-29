/**
 * Photography used around the home page. Swap any URL here to change the
 * image everywhere it appears — local files in /public work too ("/photos/x.jpg").
 */
const u = (id: string, w = 2000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export type Photo = { src: string; title: string; place: string };

/** Full-screen reveal after the hero. */
export const HORIZON: Photo = {
  src: "/photos/wave-hall.jpg",
  title: "Heydar Aliyev Centre",
  place: "Zaha Hadid Architects · Baku",
};

/** Parallax gallery — three columns of three. */
export const GALLERY: Photo[] = [
  { src: "/photos/stone-curve-house.jpg", title: "Stone Ribbon House", place: "Provence, FR" },
  { src: "/photos/pool-house.jpg", title: "Pool House", place: "Miami, US" },
  { src: "/photos/london-riverside.jpg", title: "Riverside Studies", place: "London, UK" },
  { src: u("photo-1545324418-cc1a3fa10c00", 1200), title: "Terrace Block", place: "Zurich, CH" },
  {
    src: u("photo-1512917774080-9991f1c4c750", 1200),
    title: "Pool Pavilion",
    place: "Algarve, PT",
  },
  { src: u("photo-1487958449943-2429e8be8625", 1200), title: "White Volume", place: "Porto, PT" },
  { src: u("photo-1494526585095-c41746248156", 1200), title: "Deck House", place: "Mallorca, ES" },
  { src: u("photo-1616594039964-ae9021a400a0", 1200), title: "Stone Lounge", place: "Ticino, CH" },
  {
    src: u("photo-1600596542815-ffad4c1539a9", 1200),
    title: "Lowland House",
    place: "Zeeland, NL",
  },
];

/** Backdrop behind the closing call to action. */
export const CTA_BACKDROP = "/photos/obsidian-house.jpg";
