import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Users, Calendar, Target, TrendingUp, BookOpen } from 'lucide-react';

interface TeacherStats {
  totalLessons: number;
  totalStudents: number;
  averageAttendance: number;
  totalActivities: number;
}

interface LessonAttendance {
  lessonId: string;
  lessonTitle: string;
  attendanceRate: number;
  totalStudents: number;
  presentStudents: number;
}

export const TeacherAnalytics = () => {
  const [stats, setStats] = useState<TeacherStats>({
    totalLessons: 0,
    totalStudents: 0,
    averageAttendance: 0,
    totalActivities: 0
  });
  const [lessonAttendance, setLessonAttendance] = useState<LessonAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch teacher's lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', user?.id);

      if (lessonsError) throw lessonsError;

      const totalLessons = lessons?.length || 0;

      // Fetch activities count
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('lesson_id')
        .in('lesson_id', lessons?.map(l => l.id) || []);

      if (activitiesError) throw activitiesError;

      const totalActivities = activities?.length || 0;

      // Fetch all attendance records for teacher's lessons
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('lesson_id, student_id, status')
        .in('lesson_id', lessons?.map(l => l.id) || []);

      if (attendanceError) throw attendanceError;

      // Calculate unique students
      const uniqueStudents = new Set(attendance?.map(a => a.student_id) || []).size;

      // Calculate lesson-wise attendance
      const lessonAttendanceData: LessonAttendance[] = [];
      let totalAttendanceSum = 0;

      for (const lesson of lessons || []) {
        const lessonAttendanceRecords = attendance?.filter(a => a.lesson_id === lesson.id) || [];
        const presentStudents = lessonAttendanceRecords.filter(a => a.status === 'present').length;
        const totalStudentsForLesson = lessonAttendanceRecords.length;
        const attendanceRate = totalStudentsForLesson > 0 ? Math.round((presentStudents / totalStudentsForLesson) * 100) : 0;

        lessonAttendanceData.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          attendanceRate,
          totalStudents: totalStudentsForLesson,
          presentStudents
        });

        totalAttendanceSum += attendanceRate;
      }

      const averageAttendance = totalLessons > 0 ? Math.round(totalAttendanceSum / totalLessons) : 0;

      setStats({
        totalLessons,
        totalStudents: uniqueStudents,
        averageAttendance,
        totalActivities
      });

      setLessonAttendance(lessonAttendanceData);

    } catch (error: any) {
      console.error('Error fetching teacher analytics:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Teaching Analytics</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Total Lessons</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalLessons}
            </div>
            <p className="text-sm text-muted-foreground">
              Lessons created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalStudents}
            </div>
            <p className="text-sm text-muted-foreground">
              Unique students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Avg Attendance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.averageAttendance}%
            </div>
            <p className="text-sm text-muted-foreground">
              Across all lessons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Activities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.totalActivities}
            </div>
            <p className="text-sm text-muted-foreground">
              Learning activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Attendance Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Lesson Attendance</CardTitle>
          </div>
          <CardDescription>
            Attendance rates for each of your lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lessonAttendance.map((lesson) => (
              <div key={lesson.lessonId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{lesson.lessonTitle}</h4>
                    <Badge 
                      variant={lesson.attendanceRate >= 80 ? "default" : lesson.attendanceRate >= 60 ? "secondary" : "destructive"}
                    >
                      {lesson.attendanceRate}%
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {lesson.presentStudents}/{lesson.totalStudents} students
                  </span>
                </div>
                <Progress value={lesson.attendanceRate} className="h-2" />
              </div>
            ))}
          </div>

          {lessonAttendance.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No lessons data available yet.</p>
              <p className="text-sm">Create your first lesson to see analytics!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};