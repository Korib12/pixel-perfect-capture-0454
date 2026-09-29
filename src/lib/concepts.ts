export type Concept = {
  slug: string;
  title: string;
  location: string;
  year: string;
  category: "Residential" | "Cultural" | "Hospitality" | "Urban";
  blurb: string;
  image: string;
};

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const CONCEPTS: Concept[] = [
  {
    slug: "monolith-house",
    title: "Monolith House",
    location: "Engadin, Switzerland",
    year: "2026",
    category: "Residential",
    blurb: "A single cast-concrete volume cantilevered over a glacial shelf.",
    image: u("photo-1487958449943-2429e8be8625"),
  },
  {
    slug: "pavilion-of-light",
    title: "Pavilion of Light",
    location: "Naoshima, Japan",
    year: "2025",
    category: "Cultural",
    blurb: "A daylight instrument: nine apertures tracking the solar year.",
    image: u("photo-1511818966892-d7d671e672a2"),
  },
  {
    slug: "vertical-grove",
    title: "Vertical Grove",
    location: "Singapore",
    year: "2026",
    category: "Urban",
    blurb: "Forty stories of stacked microclimates and inhabited terraces.",
    image: u("photo-1470071459604-3b5ec3a7fe05"),
  },
  {
    slug: "salt-house",
    title: "Salt House",
    location: "Algarve, Portugal",
    year: "2024",
    category: "Hospitality",
    blurb: "Lime-washed masonry dissolving into an evaporation landscape.",
    image: u("photo-1600585154340-be6161a56a0c"),
  },
  {
    slug: "the-long-gallery",
    title: "The Long Gallery",
    location: "Oslo, Norway",
    year: "2025",
    category: "Cultural",
    blurb: "A 220-metre promenade museum threaded through a rock cut.",
    image: u("photo-1518005020951-eccb494ad742"),
  },
  {
    slug: "obsidian-tower",
    title: "Obsidian Tower",
    location: "Dubai, UAE",
    year: "2027",
    category: "Urban",
    blurb: "Fritted black glass with a self-shading crystalline geometry.",
    image: u("photo-1449824913935-59a10b8d2000"),
  },
  {
    slug: "atrium-nine",
    title: "Atrium Nine",
    location: "Milan, Italy",
    year: "2024",
    category: "Hospitality",
    blurb: "Nine courtyards nested inside a restored industrial shell.",
    image: u("photo-1479839672679-a46483c0e7c8"),
  },
  {
    slug: "cliff-residence",
    title: "Cliff Residence",
    location: "Big Sur, California",
    year: "2026",
    category: "Residential",
    blurb: "Steel ribs and frameless glass pinned to a coastal escarpment.",
    image: u("photo-1600607687939-ce8a6c25118c"),
  },
  {
    slug: "the-quiet-chapel",
    title: "The Quiet Chapel",
    location: "Ávila, Spain",
    year: "2023",
    category: "Cultural",
    blurb: "Curved timber walls, one oculus, and nothing else.",
    image: "/photos/quiet-chapel.jpg",
  },
];

export const CATEGORIES = ["All", "Residential", "Cultural", "Hospitality", "Urban"] as const;

export const conceptBySlug = (slug: string) => CONCEPTS.find((c) => c.slug === slug);
