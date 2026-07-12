import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

const BUCKET_NAME = "avatars";

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  // 获取公开 URL
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// 默认灰色头像（SVG data URI）
export const DEFAULT_AVATAR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#E5E5E5"/><circle cx="60" cy="45" r="20" fill="#BDBDBD"/><path d="M20 110 Q60 70 100 110 L100 120 L20 120 Z" fill="#BDBDBD"/></svg>`
  ).toString("base64");
