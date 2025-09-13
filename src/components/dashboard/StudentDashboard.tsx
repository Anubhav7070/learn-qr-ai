import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoticesBoard } from '@/components/notices/NoticesBoard';
import { QRScanner } from '@/components/qr/QRScanner';
import { StudentAnalytics } from '@/components/analytics/StudentAnalytics';
import { Camera, Bell, BarChart3, BookOpen, Calendar, CheckCircle } from 'lucide-react';

export const StudentDashboard = () => {
  const [showQRScanner, setShowQRScanner] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Scan QR Code</CardTitle>
                  <CardDescription>Mark your attendance for classes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowQRScanner(true)}
                className="w-full"
                size="lg"
              >
                <Camera className="mr-2 h-4 w-4" />
                Open Camera
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Attendance Rate</CardTitle>
                  <CardDescription>Your overall attendance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary-foreground">85%</div>
              <p className="text-sm text-muted-foreground">Great attendance!</p>
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
            <NoticesBoard />
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your attended classes and workshops</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Activities list will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Outcomes</CardTitle>
                <CardDescription>Your progress towards learning objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Learning outcomes progress will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <StudentAnalytics />
          </TabsContent>
        </Tabs>
      </main>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner onClose={() => setShowQRScanner(false)} />
      )}
    </div>
  );
};