import type { Category, Destination, Photo } from "./types";

const TBC = "Photo credit to be confirmed";
const px = (by: string) => `${by} / Pexels`;
const P = (file: string, alt: string, width: number, height: number, credit: string, licence: Photo["licence"]): Photo => ({ src: `/journeys/nakuru/${file}.jpg`, alt, width, height, credit, licence });

const nakuruPhotos = {
  menengai: [
    P("menengai-crater-floor", "Looking across the green floor of Menengai Crater from the rim, with the crater wall on the right", 678, 452, TBC, "unconfirmed"),
    P("menengai-escarpment-cloud", "A steep green crater escarpment with trees along the rim under a cloudy sky", 640, 479, TBC, "unconfirmed"),
    P("menengai-wall-forest-edge", "The crater wall rising above forest and shrubs, with trees along the top edge", 516, 387, TBC, "unconfirmed"),
    P("menengai-rim-rocks-town-lake", "Rocks on the crater rim above the town, with a lake in the distance", 576, 384, TBC, "unconfirmed"),
    P("menengai-rocky-hill-lake", "A rocky wooded hill in warm evening light, with a lake in the distance", 704, 435, TBC, "unconfirmed"),
  ],
  hyrax: [
    P("hyrax-hill-stone-ground", "Flat rocky ground with low stone walls and hills on the horizon under a blue sky", 1800, 1200, px("Hristofor Stoyanov"), "pexels"),
  ],
  park: [
    P("lake-nakuru-flamingos-flight", "Flamingos taking off from a crowded lake shore, with forested hills behind", 1800, 1192, px("perventuator"), "pexels"),
    P("lake-nakuru-white-rhinos", "Two white rhinos facing each other on a grassy clearing with forest behind", 1800, 1200, px("Kelvin Kibe"), "pexels"),
    P("lake-nakuru-flamingos-shallows", "A large flock of flamingos standing in shallow water", 1800, 1074, px("Pankaj Mishra"), "pexels"),
    P("lake-nakuru-giraffe-woodland", "A giraffe among acacia trees in dry woodland", 1800, 1198, px("Arthur W"), "pexels"),
    P("lake-nakuru-zebra-grassland", "A zebra standing on yellow-green grassland under a heavy sky", 1192, 1800, px("perventuator"), "pexels"),
    P("lake-nakuru-rhinos-flamingos", "Two rhinos on the grass in front of a pink line of flamingos on the lake", 612, 443, "iStock preview image: licence needed before publishing", "unconfirmed"),
  ],
};

export const CATEGORY_LABEL: Record<Category, string> = {
  culture: "Culture & art",
  nature: "Nature & wildlife",
  heritage: "Historic landmarks",
  coast: "Coastal",
  adventure: "Adventure",
  local: "Local experiences",
};

const D = "draft" as const;

export const destinations: Destination[] = [
  {
    slug: "nairobi", name: "Nairobi", county: "Nairobi", region: "Central Kenya", lat: -1.2921, lng: 36.8219,
    tagline: "A capital with a national park at its edge, and a creative scene in its streets.",
    summary: "Kenya’s capital and usual point of arrival. Museums, galleries and studios sit in the same city as Nairobi National Park, which borders the urban area.",
    categories: ["culture", "nature", "local"],
    attractions: [
      { name: "Nairobi National Park", kind: "nature", note: "A wildlife park bordering the city." },
      { name: "Nairobi National Museum", kind: "culture", note: "Kenya’s natural and cultural history in one place." },
      { name: "Karen Blixen Museum", kind: "heritage", note: "A historic house museum in Karen." },
      { name: "GoDown Arts Centre", kind: "culture", note: "A multi-disciplinary arts space." },
      { name: "Giraffe Centre", kind: "nature", note: "A conservation and education centre in Karen." },
    ],
    culture: "Nairobi brings together people from across Kenya’s communities. Its art spaces and studios are best met through the artists and organisers themselves; EartGalla will list verified studio visits as partners join.",
    experiences: ["Museum and gallery visits", "Studio visits with Nairobi artists", "Local food experiences", "Nairobi National Park game drive"],
    suggestedNights: { min: 2, max: 4 }, bestTime: null, transport: null,
    related: ["naivasha", "nyeri", "nanyuki"], reviewStatus: D,
  },
  {
    slug: "nakuru", name: "Nakuru", county: "Nakuru", region: "Rift Valley", lat: -0.3031, lng: 36.08,
    tagline: "Lake, crater and a prehistoric site in the Rift Valley.",
    hero: nakuruPhotos.park[0],
    summary: "Nakuru is the base for Lake Nakuru National Park, Menengai Crater and Hyrax Hill, a prehistoric archaeological site.",
    categories: ["nature", "heritage", "adventure"],
    attractions: [
      { name: "Lake Nakuru National Park", kind: "nature", note: "A lake and wildlife park near the town.", photos: nakuruPhotos.park },
      { name: "Hyrax Hill Prehistoric Site", kind: "heritage", note: "An archaeological site with a small museum.", photos: nakuruPhotos.hyrax },
      { name: "Menengai Crater", kind: "adventure", note: "A large volcanic crater overlooking the town.", photos: nakuruPhotos.menengai },
    ],
    culture: "The Rift Valley has long been home to many communities. Cultural experiences here will be added only with named local partners and their agreement.",
    experiences: ["Game drive in Lake Nakuru National Park", "Hyrax Hill visit", "Menengai Crater viewpoint"],
    suggestedNights: { min: 1, max: 2 }, bestTime: null, transport: null,
    related: ["naivasha", "nairobi"], reviewStatus: D,
  },
  {
    slug: "naivasha", name: "Naivasha", county: "Nakuru", region: "Rift Valley", lat: -0.7172, lng: 36.431,
    tagline: "Freshwater lake, volcanic gorges and walking country.",
    summary: "Naivasha is built around Lake Naivasha, with Crescent Island, Hell’s Gate National Park and Mount Longonot nearby.",
    categories: ["nature", "adventure"],
    attractions: [
      { name: "Lake Naivasha", kind: "nature", note: "A freshwater Rift Valley lake." },
      { name: "Crescent Island Game Sanctuary", kind: "nature", note: "Walking among wildlife on an island sanctuary." },
      { name: "Hell’s Gate National Park", kind: "adventure", note: "Gorges and cliffs; walking and cycling are permitted." },
      { name: "Mount Longonot", kind: "adventure", note: "A volcano with a crater rim hike." },
    ],
    culture: "Cultural content for Naivasha is still to be developed with local partners.",
    experiences: ["Boat trip on Lake Naivasha", "Cycling or walking in Hell’s Gate", "Mount Longonot hike"],
    suggestedNights: { min: 1, max: 2 }, bestTime: null, transport: null,
    related: ["nakuru", "nairobi"], reviewStatus: D,
  },
  {
    slug: "mombasa", name: "Mombasa", county: "Mombasa", region: "Coast", lat: -4.0435, lng: 39.6682,
    tagline: "A Swahili coast port city with a fort on its harbour.",
    summary: "Mombasa’s Old Town and Fort Jesus tell the story of centuries of trade on the Indian Ocean coast.",
    categories: ["heritage", "culture", "coast", "local"],
    attractions: [
      { name: "Fort Jesus", kind: "heritage", note: "A 16th-century fort and UNESCO World Heritage Site." },
      { name: "Old Town", kind: "heritage", note: "Narrow streets of historic Swahili and coastal architecture." },
      { name: "Mama Ngina Waterfront", kind: "local", note: "A seafront promenade." },
      { name: "Haller Park (Bamburi)", kind: "nature", note: "A former cement quarry rehabilitated into a wildlife park, north of the town on the Mombasa–Malindi road. Hours, fees and feeding times change: confirm with the park." },
    ],
    culture: "Mombasa’s coastal culture reflects Swahili, Arab, Indian, Portuguese and other influences built up over centuries of trade. Walks led by Mombasa residents are the preferred way to present it.",
    experiences: ["Old Town walking tour", "Fort Jesus visit", "Coastal food experiences"],
    suggestedNights: { min: 2, max: 4 }, bestTime: null, transport: null,
    related: ["watamu", "diani", "malindi", "lamu"], reviewStatus: D,
  },
  {
    slug: "watamu", name: "Watamu", county: "Kilifi", region: "Coast", lat: -3.3536, lng: 40.0244,
    tagline: "Marine park, mangrove creek and ancient forest on the north coast.",
    summary: "Watamu is a small coastal town between Mombasa and Malindi, close to Watamu Marine National Park, Mida Creek, Arabuko Sokoke Forest and the Gedi Ruins.",
    categories: ["nature", "coast", "heritage"],
    attractions: [
      { name: "Watamu Marine National Park", kind: "nature", note: "Reef and snorkelling area off the town." },
      { name: "Local Ocean Conservation", kind: "nature", note: "A sea turtle conservation organisation based in Watamu." },
      { name: "Mida Creek", kind: "nature", note: "A tidal creek with mangroves and birdlife." },
      { name: "Arabuko Sokoke Forest", kind: "nature", note: "Coastal forest known for rare birds and the golden-rumped elephant shrew." },
      { name: "Gedi Ruins", kind: "heritage", note: "The remains of a medieval Swahili town in forest, between Watamu and Malindi." },
    ],
    culture: "Watamu sits within the long Swahili trading coast. Local cooking and culture experiences will be listed with named local hosts.",
    experiences: ["Mida Creek boat trip", "Snorkelling in the marine park", "Turtle conservation talk", "Forest walk with a guide", "Swahili cooking with a local host"],
    suggestedNights: { min: 2, max: 4 }, bestTime: null, transport: null,
    related: ["malindi", "mombasa", "diani"], reviewStatus: D,
  },
  {
    slug: "lamu", name: "Lamu", county: "Lamu", region: "Coast", lat: -2.2717, lng: 40.902,
    tagline: "One of East Africa’s oldest continuously inhabited Swahili towns.",
    summary: "Lamu Old Town is a UNESCO World Heritage Site on Lamu Island, where traditional stone architecture and dhow culture remain part of daily life.",
    categories: ["heritage", "culture", "coast", "local"],
    attractions: [
      { name: "Lamu Old Town", kind: "heritage", note: "UNESCO World Heritage Site." },
      { name: "Lamu Fort", kind: "heritage", note: "A historic fort in the town." },
      { name: "Lamu Museum", kind: "culture", note: "Swahili culture and history." },
      { name: "Shela", kind: "coast", note: "A village on the island with a long beach." },
    ],
    culture: "Lamu is a living Swahili town, not a museum. Dhow trips, craft workshops and guided walks should be booked with local operators and artisans, and visitors should follow local dress and conduct guidance.",
    experiences: ["Guided Old Town walk", "Dhow trip", "Visits with local artisans"],
    suggestedNights: { min: 2, max: 4 }, bestTime: null, transport: null,
    related: ["malindi", "mombasa"], reviewStatus: D,
  },
  {
    slug: "diani", name: "Diani", county: "Kwale", region: "Coast", lat: -4.32, lng: 39.57,
    tagline: "A long Indian Ocean beach with sacred forest and marine life nearby.",
    summary: "Diani Beach is the main resort area on the south coast, with water sports, marine activities and coastal forest.",
    categories: ["coast", "nature", "local"],
    attractions: [
      { name: "Diani Beach", kind: "coast", note: "A long white-sand beach." },
      { name: "Kaya Kinondo", kind: "culture", note: "A sacred forest of the Mijikenda community; access is by community-led visit." },
      { name: "Colobus Conservation", kind: "nature", note: "A primate conservation project." },
      { name: "Shimba Hills National Reserve", kind: "nature", note: "Coastal forest reserve inland from Diani; known for sable antelope and elephants. A day trip." },
      { name: "Wasini Island and Kisite-Mpunguti Marine Park", kind: "coast", note: "Boat day trips from Shimoni for reef snorkelling and dolphins. A full day, and not an easy fit before an afternoon train." },
    ],
    culture: "The coastal forests known as kayas are sacred to the Mijikenda. Visits must be arranged through the community and follow their protocols.",
    experiences: ["Beach time", "Snorkelling and other marine activities", "Community-led Kaya Kinondo visit"],
    suggestedNights: { min: 2, max: 5 }, bestTime: null, transport: null,
    related: ["mombasa", "watamu", "malindi"], reviewStatus: D,
  },
  {
    slug: "malindi", name: "Malindi", county: "Kilifi", region: "Coast", lat: -3.2192, lng: 40.1169,
    tagline: "Historic landmarks, ruins and marine park on the north coast.",
    summary: "Malindi combines coastal resorts with the Vasco da Gama Pillar, the Gedi Ruins and Malindi Marine National Park.",
    categories: ["heritage", "coast", "nature"],
    attractions: [
      { name: "Vasco da Gama Pillar", kind: "heritage", note: "A 15th-century Portuguese monument on the shore." },
      { name: "Gedi Ruins", kind: "heritage", note: "The remains of a medieval Swahili town." },
      { name: "Malindi Marine National Park", kind: "nature", note: "A marine protected area." },
    ],
    culture: "Malindi has been a trading port for centuries. Local cultural experiences will be listed with named partners.",
    experiences: ["Gedi Ruins visit", "Marine park boat trip", "Coastal food experiences"],
    suggestedNights: { min: 2, max: 3 }, bestTime: null, transport: null,
    related: ["watamu", "lamu", "mombasa", "diani"], reviewStatus: D,
  },
  {
    slug: "nanyuki", name: "Nanyuki", county: "Laikipia", region: "Central Kenya", lat: 0.0167, lng: 37.0667,
    tagline: "At the foot of Mount Kenya, on the equator.",
    summary: "Nanyuki is a gateway to Mount Kenya and to wildlife conservancies on the Laikipia plateau, including Ol Pejeta.",
    categories: ["nature", "adventure", "local"],
    attractions: [
      { name: "Mount Kenya", kind: "adventure", note: "Kenya’s highest mountain; treks need a licensed guide." },
      { name: "Ol Pejeta Conservancy", kind: "nature", note: "A wildlife conservancy near Nanyuki." },
      { name: "Equator marker", kind: "local", note: "Roadside markers where the equator crosses the highway." },
    ],
    culture: "Cultural content for Nanyuki is still to be developed with local communities.",
    experiences: ["Mount Kenya day walks", "Conservancy game drive"],
    suggestedNights: { min: 2, max: 3 }, bestTime: null, transport: null,
    related: ["nyeri", "nairobi"], reviewStatus: D,
  },
  {
    slug: "kisumu", name: "Kisumu", county: "Kisumu", region: "Western Kenya", lat: -0.0917, lng: 34.768,
    tagline: "A lakeside city on Lake Victoria.",
    summary: "Kisumu sits on the Winam Gulf of Lake Victoria, with waterfront life, fishing communities and the Luo cultural heritage of the region.",
    categories: ["culture", "nature", "local"],
    attractions: [
      { name: "Lake Victoria waterfront", kind: "local", note: "Lakeside life and boat trips." },
      { name: "Kisumu Museum", kind: "culture", note: "Regional culture and natural history." },
      { name: "Kisumu Impala Sanctuary", kind: "nature", note: "A small lakeside wildlife sanctuary." },
      { name: "Dunga Beach", kind: "local", note: "A fishing village on the lake." },
    ],
    culture: "Kisumu is the main city of the Luo community’s homeland. Food, music and storytelling experiences will be added with local hosts.",
    experiences: ["Lake boat trip", "Local fish and traditional food", "Museum visit"],
    suggestedNights: { min: 2, max: 3 }, bestTime: null, transport: null,
    related: [], reviewStatus: D,
  },
  {
    slug: "nyeri", name: "Nyeri", county: "Nyeri", region: "Central Kenya", lat: -0.4201, lng: 36.9476,
    tagline: "Highland farming country between Mount Kenya and the Aberdares.",
    summary: "Nyeri lies between Mount Kenya and the Aberdare Range, in the heartland of Kenya’s central highlands.",
    categories: ["nature", "culture", "local"],
    attractions: [
      { name: "Aberdare National Park", kind: "nature", note: "Moorland, forest and waterfalls." },
      { name: "Mount Kenya", kind: "adventure", note: "Reached from Nyeri via the Naro Moru and other routes." },
      { name: "Baden-Powell’s grave", kind: "heritage", note: "A well-known historic grave in Nyeri." },
    ],
    culture: "Nyeri is part of the Kikuyu heartland. Farm and food experiences should be arranged directly with local farmers and hosts.",
    experiences: ["Farm and food visit", "Aberdares day trip", "Mount Kenya access routes"],
    suggestedNights: { min: 1, max: 3 }, bestTime: null, transport: null,
    related: ["nanyuki", "nairobi"], reviewStatus: D,
  },
];

export const bySlug = (s: string) => destinations.find((d) => d.slug === s);
