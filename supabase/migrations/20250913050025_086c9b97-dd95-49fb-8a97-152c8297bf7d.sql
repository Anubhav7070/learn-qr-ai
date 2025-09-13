-- Enable realtime for attendance table
ALTER TABLE public.attendance REPLICA IDENTITY FULL;

-- Add attendance table to realtime publication  
ALTER publication supabase_realtime ADD TABLE public.attendance;

-- Ensure proper unique constraint to prevent duplicate attendance
CREATE UNIQUE INDEX IF NOT EXISTS unique_student_lesson_attendance 
ON public.attendance (student_id, lesson_id);