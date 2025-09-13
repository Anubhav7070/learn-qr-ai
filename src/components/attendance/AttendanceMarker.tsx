import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, MapPin } from 'lucide-react';

interface AttendanceMarkerProps {
  lessonId: string;
  lessonTitle: string;
  onAttendanceMarked?: () => void;
}

export const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({ 
  lessonId, 
  lessonTitle, 
  onAttendanceMarked 
}) => {
  const [isMarking, setIsMarking] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const markAttendance = async () => {
    if (!user) return;

    setIsMarking(true);
    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          lesson_id: lessonId,
          student_id: user.id,
          status: 'present',
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      setIsMarked(true);
      toast({
        title: "Attendance Marked!",
        description: `You have been marked present for "${lessonTitle}"`,
      });

      onAttendanceMarked?.();
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "You have already marked attendance for this lesson"
          : "Failed to mark attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Mark Attendance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Lesson: {lessonTitle}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Clock className="h-4 w-4" />
              <span>Time: {new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <Button
            onClick={markAttendance}
            disabled={isMarking || isMarked}
            className="w-full"
            variant={isMarked ? "secondary" : "default"}
          >
            {isMarking ? (
              'Marking Attendance...'
            ) : isMarked ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Attendance Marked
              </>
            ) : (
              'Mark Present'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};