-- Add notices table for notices board functionality
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Create policies for notices access
CREATE POLICY "Everyone can view notices" 
ON public.notices 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can create notices" 
ON public.notices 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
  )
);

CREATE POLICY "Teachers can update their own notices" 
ON public.notices 
FOR UPDATE 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Teachers can delete their own notices" 
ON public.notices 
FOR DELETE 
USING (created_by = auth.uid());

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_notices_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add learning_outcomes table for mapping activities to outcomes
CREATE TABLE public.learning_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- LO1, LO2, etc.
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for learning_outcomes
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;

-- Create policies for learning outcomes
CREATE POLICY "Everyone can view learning outcomes" 
ON public.learning_outcomes 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can manage learning outcomes" 
ON public.learning_outcomes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
  )
);

-- Add activity_outcomes mapping table
CREATE TABLE public.activity_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL,
  outcome_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, outcome_id)
);

-- Enable RLS for activity_outcomes
ALTER TABLE public.activity_outcomes ENABLE ROW LEVEL SECURITY;

-- Create policies for activity outcomes mapping
CREATE POLICY "Everyone can view activity outcomes" 
ON public.activity_outcomes 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can manage activity outcomes" 
ON public.activity_outcomes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'teacher'
  )
);

-- Insert some default learning outcomes
INSERT INTO public.learning_outcomes (code, title, description) VALUES
('LO1', 'Knowledge and Understanding', 'Demonstrate comprehensive knowledge and understanding of the subject matter'),
('LO2', 'Application of Knowledge', 'Apply theoretical knowledge to practical situations and real-world problems'),
('LO3', 'Analysis and Evaluation', 'Analyze complex problems and evaluate different solutions critically'),
('LO4', 'Communication Skills', 'Communicate effectively in written and oral forms'),
('LO5', 'Teamwork and Collaboration', 'Work effectively as part of a team and collaborate with others'),
('LO6', 'Problem Solving', 'Identify, analyze, and solve complex problems using appropriate methods'),
('LO7', 'Research Skills', 'Conduct independent research and gather relevant information'),
('LO8', 'Professional Development', 'Demonstrate professional behavior and commitment to lifelong learning');