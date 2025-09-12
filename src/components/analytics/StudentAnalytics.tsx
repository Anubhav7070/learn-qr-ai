import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Calendar, CheckCircle, Target, TrendingUp } from 'lucide-react';

interface AttendanceStats {
  totalLessons: number;
  attendedLessons: number;
  attendanceRate: number;
}

interface OutcomeProgress {
  outcomeCode: string;
  outcomeTitle: string;
  progress: number;
  activitiesCount: number;
}

export const StudentAnalytics = () => {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalLessons: 0,
    attendedLessons: 0,
    attendanceRate: 0
  });
  const [outcomeProgress, setOutcomeProgress] = useState<OutcomeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch attendance statistics
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('lesson_id, status')
        .eq('student_id', user?.id);

      if (attendanceError) throw attendanceError;

      // Fetch total lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id');

      if (lessonsError) throw lessonsError;

      const totalLessons = lessons?.length || 0;
      const attendedLessons = attendance?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : 0;

      setAttendanceStats({
        totalLessons,
        attendedLessons,
        attendanceRate
      });

      // Fetch learning outcomes progress
      const { data: outcomes, error: outcomesError } = await supabase
        .from('learning_outcomes')
        .select('*')
        .order('code');

      if (outcomesError) throw outcomesError;

      // Calculate progress for each outcome
      const progressData: OutcomeProgress[] = [];
      
      for (const outcome of outcomes || []) {
        // Get activities mapped to this outcome that the student attended
        const { data: attendedActivities, error } = await supabase
          .from('activity_outcomes')
          .select(`
            activities!inner(
              lesson_id,
              lessons!inner(
                attendance!inner(
                  student_id,
                  status
                )
              )
            )
          `)
          .eq('outcome_id', outcome.id)
          .eq('activities.lessons.attendance.student_id', user?.id)
          .eq('activities.lessons.attendance.status', 'present');

        if (!error) {
          const activitiesCount = attendedActivities?.length || 0;
          // Simple progress calculation - could be more sophisticated
          const progress = Math.min(activitiesCount * 25, 100); // 25% per activity, max 100%
          
          progressData.push({
            outcomeCode: outcome.code,
            outcomeTitle: outcome.title,
            progress,
            activitiesCount
          });
        }
      }

      setOutcomeProgress(progressData);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
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
        <h2 className="text-xl font-semibold">Your Analytics</h2>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Attendance Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {attendanceStats.attendanceRate}%
            </div>
            <p className="text-sm text-muted-foreground">
              {attendanceStats.attendedLessons} of {attendanceStats.totalLessons} classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Classes Attended</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {attendanceStats.attendedLessons}
            </div>
            <p className="text-sm text-muted-foreground">
              Total classes attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Outcomes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {outcomeProgress.filter(o => o.progress >= 50).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Outcomes 50%+ complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Outcomes Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Learning Outcomes Progress</CardTitle>
          </div>
          <CardDescription>
            Your progress towards achieving each learning outcome
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outcomeProgress.map((outcome) => (
              <div key={outcome.outcomeCode} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{outcome.outcomeCode}</Badge>
                    <span className="font-medium">{outcome.outcomeTitle}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {outcome.activitiesCount} activities
                    </span>
                    <span className="text-sm font-medium">{outcome.progress}%</span>
                  </div>
                </div>
                <Progress value={outcome.progress} className="h-2" />
              </div>
            ))}
          </div>

          {outcomeProgress.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No learning outcomes data available yet.</p>
              <p className="text-sm">Attend some activities to see your progress!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};