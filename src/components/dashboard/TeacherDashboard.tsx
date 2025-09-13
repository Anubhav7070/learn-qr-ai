import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoticesBoard } from '@/components/notices/NoticesBoard';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { TeacherAnalytics } from '@/components/analytics/TeacherAnalytics';
import { CreateNoticeForm } from '@/components/notices/CreateNoticeForm';
import { CreateActivityForm } from '@/components/activities/CreateActivityForm';
import { QrCode, Bell, BarChart3, BookOpen, Calendar, Plus, Users } from 'lucide-react';

export const TeacherDashboard = () => {
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Generate QR</CardTitle>
                  <CardDescription>Create attendance QR code</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowQRGenerator(true)}
                className="w-full"
                size="lg"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Plus className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">New Notice</CardTitle>
                  <CardDescription>Post announcements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowCreateNotice(true)}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Notice
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">New Activity</CardTitle>
                  <CardDescription>Create learning activity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowCreateActivity(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="notices" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="notices" className="flex items-center space-x-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notices</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Outcomes</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notices" className="mt-6">
            <NoticesBoard isTeacher />
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Activities</CardTitle>
                <CardDescription>View and manage your learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Activities management will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Outcomes Management</CardTitle>
                <CardDescription>Manage and map learning outcomes to activities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Learning outcomes management will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <TeacherAnalytics />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {showCreateNotice && (
        <CreateNoticeForm onClose={() => setShowCreateNotice(false)} />
      )}

      {showCreateActivity && (
        <CreateActivityForm onClose={() => setShowCreateActivity(false)} />
      )}

      {showQRGenerator && (
        <QRGenerator onClose={() => setShowQRGenerator(false)} />
      )}
    </div>
  );
};