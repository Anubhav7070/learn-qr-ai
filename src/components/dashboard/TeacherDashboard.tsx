import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, Calendar, QrCode, Plus, MessageSquare, BarChart3 } from 'lucide-react';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { CreateNoticeForm } from '@/components/notices/CreateNoticeForm';
import { CreateActivityForm } from '@/components/activities/CreateActivityForm';
import { NoticesBoard } from '@/components/notices/NoticesBoard';
import { TeacherAnalytics } from '@/components/analytics/TeacherAnalytics';
import { AIAssistant } from '@/components/activities/AIAssistant';
import { LessonQRGenerator } from '@/components/qr/LessonQRGenerator';

export const TeacherDashboard = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
    fetchAttendance();
    
    // Set up real-time attendance updates
    const channel = supabase
      .channel('attendance-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance'
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchLessons = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', user.id)
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

  const fetchAttendance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          lessons!inner(title, teacher_id),
          profiles!inner(name)
        `)
        .eq('lessons.teacher_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setAttendanceData(data || []);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        
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
            onClick={() => setActiveTab('attendance')}
            variant={activeTab === 'attendance' ? 'default' : 'outline'}
          >
            <Users className="mr-2 h-4 w-4" />
            Attendance
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">My Lessons</h3>
                <Button onClick={() => setShowCreateActivity(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Activity
                </Button>
              </div>
              
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
                          {lesson.qr_code ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {lessons.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No lessons created yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {selectedLesson && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <QrCode className="h-5 w-5" />
                      <span>QR Code for Attendance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LessonQRGenerator
                      lessonId={selectedLesson.id}
                      lessonTitle={selectedLesson.title}
                      onQRGenerated={(qrCode) => {
                        setSelectedLesson(prev => ({ ...prev, qr_code: qrCode }));
                        fetchLessons();
                      }}
                    />
                  </CardContent>
                </Card>
              )}
              
              <AIAssistant context="Teacher lesson planning and activity creation" />
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Recent Attendance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceData.map((attendance) => (
                    <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {attendance.profiles?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{attendance.profiles?.name}</p>
                          <p className="text-sm text-muted-foreground">{attendance.lessons?.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={attendance.status === 'present' ? 'default' : 'secondary'}>
                          {attendance.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(attendance.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {attendanceData.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No attendance records yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notices' && <NoticesBoard isTeacher />}

        {activeTab === 'analytics' && <TeacherAnalytics />}
      </div>

      {showCreateNotice && (
        <CreateNoticeForm onClose={() => setShowCreateNotice(false)} />
      )}

      {showCreateActivity && (
        <CreateActivityForm onClose={() => setShowCreateActivity(false)} />
      )}
    </div>
  );
};