import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob (capas de evento, avisos, fotos da galeria)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Fotos de álbuns linkados a pastas do Google Drive (ver src/lib/google-drive.ts)
      { protocol: "https", hostname: "drive.google.com" },
    ],
    // Padrão do Next é só 75 — baixo demais pra fotos de verdade (perde muito
    // detalhe no reencode). 90 é o que os componentes de foto pedem explicitamente.
    qualities: [75, 90],
  },
};

export default nextConfig;
