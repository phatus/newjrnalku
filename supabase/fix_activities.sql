
-- Run this SQL in your Supabase SQL Editor to enable all teaching-specific fields
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS teaching_hours TEXT,
ADD COLUMN IF NOT EXISTS learning_material TEXT,
ADD COLUMN IF NOT EXISTS learning_outcome TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Selesai';

-- Added unique constraint for profile role if needed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guru';

-- Set your user as admin (Replace with your actual User ID if you know it, 
-- or use the Admin panel later to manage roles if implemented)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
