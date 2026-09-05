-- TRILHAS
CREATE TABLE public.learning_tracks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  platform text,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','planned','completed')),
  lessons_completed integer NOT NULL DEFAULT 0,
  total_lessons integer NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  url text,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.learning_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_tracks TO authenticated;
GRANT ALL ON public.learning_tracks TO service_role;

ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracks" ON public.learning_tracks FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert tracks" ON public.learning_tracks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update tracks" ON public.learning_tracks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete tracks" ON public.learning_tracks FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_learning_tracks_updated_at
BEFORE UPDATE ON public.learning_tracks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POSTS DO BLOG
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_url text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts" ON public.posts FOR SELECT USING (published = true);
CREATE POLICY "Authenticated can view all posts" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update posts" ON public.posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete posts" ON public.posts FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PLATAFORMAS
CREATE TABLE public.platforms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  url text,
  description text,
  color text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platforms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platforms TO authenticated;
GRANT ALL ON public.platforms TO service_role;

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platforms" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert platforms" ON public.platforms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update platforms" ON public.platforms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete platforms" ON public.platforms FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_platforms_updated_at
BEFORE UPDATE ON public.platforms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platforms (name, url, description, color, position) VALUES
  ('Alura', 'https://www.alura.com.br', 'Cursos de tecnologia e programação', '#0a7', 0),
  ('DIO', 'https://www.dio.me', 'Bootcamps e formações gratuitas', '#15c', 1),
  ('Hashtag Treinamentos', 'https://www.hashtagtreinamentos.com', 'Cursos de programação e dados', '#e63', 2),
  ('Coursera', 'https://www.coursera.org', 'Cursos de universidades do mundo todo', '#06c', 3),
  ('Santander Open Academy', 'https://www.santanderopenacademy.com', 'Bolsas e cursos do Santander', '#e30', 4),
  ('Faculdade Gran', 'https://faculdade.grancursosonline.com.br', 'Graduação e pós em tecnologia', '#3b82f6', 5);