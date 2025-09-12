import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Calendar, User, Edit, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Notice {
  id: string;
  title: string;
  description: string;
  created_by: string;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
  };
}

interface NoticesBoardProps {
  isTeacher?: boolean;
}

export const NoticesBoard: React.FC<NoticesBoardProps> = ({ isTeacher = false }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error: any) {
      console.error('Error fetching notices:', error);
      toast({
        title: "Error",
        description: "Failed to load notices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeId);

      if (error) throw error;

      setNotices(notices.filter(notice => notice.id !== noticeId));
      toast({
        title: "Notice deleted",
        description: "The notice has been removed successfully."
      });
    } catch (error: any) {
      console.error('Error deleting notice:', error);
      toast({
        title: "Error",
        description: "Failed to delete notice",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Notices Board</h2>
        </div>
        <Badge variant="secondary">{notices.length} notices</Badge>
      </div>

      {notices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notices Yet</h3>
            <p className="text-muted-foreground">
              {isTeacher ? 'Create your first notice to get started.' : 'Check back later for announcements.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Faculty</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(notice.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isTeacher && notice.created_by === user?.id && (
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteNotice(notice.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{notice.description}</p>
                
                {notice.attachment_url && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Attachment</span>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-xs" asChild>
                      <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                        View attachment
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};