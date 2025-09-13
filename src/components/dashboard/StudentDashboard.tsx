import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, QrCode, Calendar, MessageSquare, BarChart3, Users } from 'lucide-react';
import { QRScanner } from '@/components/qr/QRScanner'; 
import { NoticesBoard } from '@/components/notices/NoticesBoard';
import { StudentAnalytics } from '@/components/analytics/StudentAnalytics';
import { AttendanceMarker } from '@/components/attendance/AttendanceMarker';
import { AIAssistant } from '@/components/activities/AIAssistant';
import { Button } from '@/components/ui/button';

export const StudentDashboard = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
  }, [user]);

  const fetchLessons = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('lesson_date', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lessons",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => setActiveTab('lessons')}
            variant={activeTab === 'lessons' ? 'default' : 'outline'}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Lessons
          </Button>
          <Button
            onClick={() => setActiveTab('notices')}
            variant={activeTab === 'notices' ? 'default' : 'outline'}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Notices
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>

        {activeTab === 'lessons' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Lessons</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lessons.map((lesson) => (
                  <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedLesson(lesson)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(lesson.lesson_date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant={lesson.qr_code ? 'default' : 'secondary'}>
                          {lesson.qr_code ? 'Available' : 'Coming Soon'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {lessons.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No lessons available yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {selectedLesson && (
                <AttendanceMarker
                  lessonId={selectedLesson.id}
                  lessonTitle={selectedLesson.title}
                  onAttendanceMarked={() => fetchLessons()}
                />
              )}
              
              <AIAssistant context="Student learning support and study assistance" />
            </div>
          </div>
        )}

        {activeTab === 'notices' && <NoticesBoard />}

        {activeTab === 'analytics' && <StudentAnalytics />}
      </div>
    </div>
  );
};