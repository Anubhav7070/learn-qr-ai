import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { X, Send, BookOpen, Sparkles } from 'lucide-react';

interface LearningOutcome {
  id: string;
  code: string;
  title: string;
  description: string;
}

interface CreateActivityFormProps {
  onClose: () => void;
}

export const CreateActivityForm: React.FC<CreateActivityFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lesson_date: new Date().toISOString().slice(0, 16)
  });
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLearningOutcomes();
  }, []);

  const fetchLearningOutcomes = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_outcomes')
        .select('*')
        .order('code');

      if (error) throw error;
      setLearningOutcomes(data || []);
    } catch (error: any) {
      console.error('Error fetching learning outcomes:', error);
    }
  };

  const generateAISuggestions = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter an activity description first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      // For now, we'll simulate AI suggestions by selecting relevant outcomes
      // In a real implementation, this would call an OpenAI edge function
      
      // Simple keyword-based suggestion simulation
      const description = formData.description.toLowerCase();
      const suggestions: string[] = [];

      if (description.includes('knowledge') || description.includes('understand') || description.includes('learn')) {
        suggestions.push(learningOutcomes.find(lo => lo.code === 'LO1')?.id || '');
      }
      if (description.includes('apply') || description.includes('practice') || description.includes('implement')) {
        suggestions.push(learningOutcomes.find(lo => lo.code === 'LO2')?.id || '');
      }
      if (description.includes('analyze') || description.includes('evaluate') || description.includes('assess')) {
        suggestions.push(learningOutcomes.find(lo => lo.code === 'LO3')?.id || '');
      }
      if (description.includes('communicate') || description.includes('present') || description.includes('write')) {
        suggestions.push(learningOutcomes.find(lo => lo.code === 'LO4')?.id || '');
      }
      if (description.includes('team') || description.includes('group') || description.includes('collaborate')) {
        suggestions.push(learningOutcomes.find(lo => lo.code === 'LO5')?.id || '');
      }
      if (description.includes('problem') || description.includes('solve') || description.includes('solution')) {
        suggestions.push(learningOutcomes.find(lo => lo.code === 'LO6')?.id || '');
      }

      const validSuggestions = suggestions.filter(id => id);
      setSelectedOutcomes(prev => [...new Set([...prev, ...validSuggestions])]);

      toast({
        title: "AI Suggestions Applied!",
        description: `Found ${validSuggestions.length} relevant learning outcomes`,
      });

    } catch (error: any) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleOutcomeToggle = (outcomeId: string) => {
    setSelectedOutcomes(prev => 
      prev.includes(outcomeId) 
        ? prev.filter(id => id !== outcomeId)
        : [...prev, outcomeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create lesson first
      const lessonId = crypto.randomUUID();
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          id: lessonId,
          title: formData.title,
          description: formData.description,
          lesson_date: formData.lesson_date,
          teacher_id: user?.id,
          qr_code: '' // Will be generated when QR is created
        });

      if (lessonError) throw lessonError;

      // Create activity
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .insert({
          lesson_id: lessonId,
          activity_description: formData.description,
          confidence_score: 0.8,
          ai_outcome: `AI-mapped outcomes: ${selectedOutcomes.length} outcomes selected`
        })
        .select()
        .single();

      if (activityError) throw activityError;

      // Map selected learning outcomes
      if (selectedOutcomes.length > 0) {
        const mappings = selectedOutcomes.map(outcomeId => ({
          activity_id: activity.id,
          outcome_id: outcomeId
        }));

        const { error: mappingError } = await supabase
          .from('activity_outcomes')
          .insert(mappings);

        if (mappingError) throw mappingError;
      }

      toast({
        title: "Activity Created!",
        description: `Activity "${formData.title}" has been created with ${selectedOutcomes.length} learning outcomes.`,
      });

      onClose();
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Create Learning Activity</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              placeholder="Enter activity title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the learning activity in detail"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Activity Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.lesson_date}
              onChange={(e) => setFormData({ ...formData, lesson_date: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Learning Outcomes Mapping</Label>
              <Button
                type="button"
                onClick={generateAISuggestions}
                disabled={isGeneratingAI || !formData.description.trim()}
                size="sm"
                variant="outline"
              >
                {isGeneratingAI ? (
                  'Generating...'
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {learningOutcomes.map((outcome) => (
                <div key={outcome.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={outcome.id}
                    checked={selectedOutcomes.includes(outcome.id)}
                    onCheckedChange={() => handleOutcomeToggle(outcome.id)}
                  />
                  <div className="space-y-1 flex-1">
                    <label htmlFor={outcome.id} className="text-sm font-medium cursor-pointer">
                      {outcome.code}: {outcome.title}
                    </label>
                    <p className="text-xs text-muted-foreground">{outcome.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Selected {selectedOutcomes.length} of {learningOutcomes.length} outcomes
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Activity
                </>
              )}
            </Button>
            <Button type="button" onClick={onClose} variant="outline">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};