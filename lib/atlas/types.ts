/**
 * The Living Atlas content model.
 *
 * Every record, whatever its kind, carries the same governance fields: who may see it (permissions), where it
 * came from (sources), who is credited (attribution) and where it is in review (status). Nothing is published
 * without them. Claims inside a record are typed, so a verified fact, an attributed oral account and an
 * interpretation are never presented as the same kind of statement.
 *
 * Communities, practices and places reference each other by id, many-to-many, so overlapping identities and
 * alternative classifications are representable. There is deliberately no fixed list of communities.
 */

export type RecordStatus = "draft" | "in-review" | "published" | "withdrawn";

export type SourceKind = "catalogue" | "interview" | "oral-account" | "publication" | "archive" | "field-note";

export type Source = {
  id: string;
  kind: SourceKind;
  title: string;
  /** who gave or wrote it — a person, a community body or an organisation */
  holder: string;
  url?: string;
  /** ISO date the source was recorded or published, if known */
  date?: string;
};

export type PermissionLevel = "public" | "attribution-required" | "community-restricted" | "withheld";

export type Permission = {
  level: PermissionLevel;
  /** who granted it, and in what form (e.g. "written consent from the maker") — required for anything but "withheld" */
  grantedBy: string | null;
  /** may this material be used commercially? Defaults to false. */
  commercial: boolean;
  note?: string;
};

export type ClaimKind =
  | "verified" // checked against a source we can cite
  | "attributed" // an account given by a named person or group, shown as theirs
  | "interpretation"; // a reading or opinion, shown as such

export type Claim = {
  kind: ClaimKind;
  text: string;
  /** ids from the record's `sources` that support this claim; attributed claims must name their speaker */
  sourceIds: string[];
  speaker?: string;
};

export type Attribution = {
  /** person or group credited, with the role they hold in this record */
  name: string;
  role: "maker" | "knowledge-holder" | "photographer" | "author" | "contributor";
};

export type AtlasRecordBase = {
  id: string;
  slug: string;
  /** names a community or maker uses for themselves come first; the rest are alternates, never overwritten */
  names: { primary: string; alternates?: string[]; language?: string };
  summary: string | null;
  claims: Claim[];
  sources: Source[];
  attribution: Attribution[];
  permission: Permission;
  status: RecordStatus;
  reviewedBy: string | null;
  updatedAt: string;
  coverImage: string | null;
};

export type Community = AtlasRecordBase & {
  type: "community";
  /** another community this one is part of or overlaps with — a list, because identities overlap */
  relatedCommunityIds: string[];
  placeIds: string[];
  languages: string[];
  practiceIds: string[];
  /** shown on every profile: no community is uniform */
  diversityNote: string;
};

export type Practice = AtlasRecordBase & {
  type: "practice";
  /** how the platform classifies it; alternates are allowed because classification is contested */
  classifications: { scheme: string; label: string }[];
  materials: string[];
  techniques: string[];
  communityIds: string[];
  placeIds: string[];
  artistIds: string[];
  artworkIds: string[];
  storySlugs: string[];
  /** "traditional" and "contemporary" are not opposites; a practice can be both */
  era: ("traditional" | "contemporary")[];
};

export type Place = {
  id: string;
  type: "place";
  slug: string;
  name: string;
  /** "city", "region", "county" … — a place is a location, not a cultural boundary */
  scale: "city" | "region" | "county" | "country";
  artistIds: string[];
  practiceIds: string[];
  communityIds: string[];
};

/** One row of the unified Explore index, whatever the underlying record is. */
export type ExploreType = "practice" | "community" | "place" | "artist" | "work" | "story";

export type ExploreItem = {
  id: string;
  type: ExploreType;
  title: string;
  blurb: string | null;
  href: string;
  image: string | null;
  /** free-form facets used by the filters */
  facets: { era?: string[]; material?: string[]; topic?: string[]; place?: string[]; practice?: string[] };
  /** lower-cased text the search box matches against */
  haystack: string;
};
