import { createServerClient } from "./server";

const BUCKET = "documentos";

// Faz upload de um buffer (PDF ou HTML) e retorna o path público.
export async function uploadDocumento(
  path: string,
  buffer: Buffer,
  contentType: "application/pdf" | "text/html" | "text/plain"
): Promise<string> {
  const supabase = createServerClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload falhou: ${error.message}`);

  return path;
}

// Gera URL assinada com validade em segundos (default: 1 hora).
export async function getDocumentoUrl(
  path: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data) throw new Error(`URL do documento falhou: ${error?.message}`);

  return data.signedUrl;
}

// Remove arquivo do Storage.
export async function deleteDocumento(path: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
