import "server-only";
import { del } from "@vercel/blob";

/** Remove uma imagem do Vercel Blob, se o path for realmente um blob nosso (não derruba se já não existir). */
export async function deleteBlobIfExists(path: string | null | undefined) {
  if (!path || !path.includes("blob.vercel-storage.com")) return;
  try {
    await del(path);
  } catch {
    // já removido ou storage ainda não provisionado — não bloqueia a operação principal
  }
}
