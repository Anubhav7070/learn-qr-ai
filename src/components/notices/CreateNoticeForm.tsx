import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { X, Send, FileText } from 'lucide-react';

interface CreateNoticeFormProps {
  onClose: () => void;
}

export const CreateNoticeForm: React.FC<CreateNoticeFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachment: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
      let attachmentUrl = null;

      // Handle file upload if present
      if (formData.attachment) {
        const fileExt = formData.attachment.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        // Note: This would require storage bucket setup
        // For now, we'll skip file upload and just store the notice
      }

      // Insert notice
      const { error } = await supabase
        .from('notices')
        .insert({
          title: formData.title,
          description: formData.description,
          created_by: user?.id,
          attachment_url: attachmentUrl
        });

      if (error) throw error;

      toast({
        title: "Notice Created!",
        description: "Your notice has been posted successfully.",
      });

      onClose();
    } catch (error: any) {
      console.error('Error creating notice:', error);
      toast({
        title: "Error",
        description: "Failed to create notice",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Create New Notice</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter notice title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter notice description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            <Input
              id="attachment"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Notice
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