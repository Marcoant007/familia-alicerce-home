// Extrai o ID de uma pasta do Google Drive a partir do link compartilhado
// (ex.: https://drive.google.com/drive/folders/1AbCdEf...?usp=sharing) pra
// montar o embed público. A pasta precisa estar como "Qualquer pessoa com o
// link pode ver" no Drive, senão o embed mostra "Acesso negado".

const FOLDER_PATH_PATTERN = /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/;

export function extractDriveFolderId(url: string): string | null {
  const pathMatch = url.match(FOLDER_PATH_PATTERN);
  if (pathMatch) return pathMatch[1];

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("drive.google.com")) return null;
    const id = parsed.searchParams.get("id");
    return id || null;
  } catch {
    return null;
  }
}

export function driveEmbedUrl(driveUrl: string): string | null {
  const folderId = extractDriveFolderId(driveUrl);
  if (!folderId) return null;
  return `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
}

/** URL direta da imagem (não expira, ao contrário do thumbnailLink da API) — funciona pra qualquer arquivo público. */
export function driveImageUrl(fileId: string, width = 1000) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

export type DriveImage = { id: string; name: string };

/**
 * Lista as imagens de uma pasta pública via API do Drive (precisa de
 * GOOGLE_DRIVE_API_KEY — ver .env.example). Sem a chave, ou se a chamada
 * falhar, retorna [] — quem chamar deve cair pro embed (driveEmbedUrl) nesse caso.
 */
export async function listDriveFolderImages(driveUrl: string): Promise<DriveImage[]> {
  const folderId = extractDriveFolderId(driveUrl);
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!folderId || !apiKey) return [];

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    key: apiKey,
    fields: "files(id,name)",
    orderBy: "name",
    pageSize: "200",
  });

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { files?: DriveImage[] };
    return data.files ?? [];
  } catch {
    return [];
  }
}
