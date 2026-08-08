import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image, Supabase Storage'daki görselleri (bkz.
    // lib/supabase/storage.ts) optimize edebilsin diye izinli host —
    // sadece herkese açık storage yoluna kapsam daraltıldı.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vchodvviufmdwomkjrjb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
