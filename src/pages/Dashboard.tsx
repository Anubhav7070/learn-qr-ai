import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';

const Dashboard = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
    </div>
  );
};

export default Dashboard;