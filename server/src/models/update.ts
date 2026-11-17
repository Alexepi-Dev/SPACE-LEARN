export type UpdateStatus = 'draft' | 'scheduled' | 'published' | 'cancelled';

export interface UpdateInfo {
  id: string; // uuid
  version: string; // semver e.g., "1.2.0"
  title: string;
  description: string;
  releaseDate?: string; // ISO date when published
  changelog: string[]; // list of bullet points
  fixes: string[]; // list of bug fixes
  improvements: string[]; // list of improvements
  status: UpdateStatus;
  scheduledAt?: string; // ISO date for scheduled publish
  notesUrl?: string; // optional link to detailed notes
}
