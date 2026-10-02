-- Photo board: each signed-in user's own projects + private photo storage.

CREATE TABLE IF NOT EXISTS public.board_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  photo_paths TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS board_projects_user_idx ON public.board_projects (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_projects TO authenticated;
GRANT ALL ON public.board_projects TO service_role;
ALTER TABLE public.board_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "board_projects_own" ON public.board_projects;
CREATE POLICY "board_projects_own" ON public.board_projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Private bucket; files live under "<user id>/<project id>/<n>.jpg"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('board-photos', 'board-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "board_photos_read_own" ON storage.objects;
CREATE POLICY "board_photos_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'board-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "board_photos_insert_own" ON storage.objects;
CREATE POLICY "board_photos_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'board-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "board_photos_delete_own" ON storage.objects;
CREATE POLICY "board_photos_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'board-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
