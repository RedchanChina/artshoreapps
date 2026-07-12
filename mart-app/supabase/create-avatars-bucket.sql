-- 创建 avatars 存储桶（公开读取）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 允许公开读取
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 允许认证用户上传到自己的路径
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
