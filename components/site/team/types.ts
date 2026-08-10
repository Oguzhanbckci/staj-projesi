// team_members tablosunun 1:1 karşılığı — tek varyant (ızgara), bkz.
// docs/VERİ-MODELİ.md.
export interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  bio: string | null;
  photoPath: string | null;
}
