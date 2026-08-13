import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { TeamMember } from "./types";

export function TeamMemberCard({ fullName, role, bio, photoPath }: TeamMember) {
  const photoUrl = photoPath ? getPublicImageUrl("team", photoPath) : null;

  return (
    <Card className="p-6 text-center">
      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-surface">
        {photoUrl && (
          <Image
            src={photoUrl}
            alt={fullName}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </div>
      <p className="mt-4 text-h6 font-bold text-text">{fullName}</p>
      <p className="mt-1 text-caption font-semibold text-brand">{role}</p>
      {bio && <p className="mt-3 line-clamp-3 text-base text-text-muted">{bio}</p>}
    </Card>
  );
}
