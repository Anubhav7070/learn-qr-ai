import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, X, CheckCircle } from 'lucide-react';

interface QRScannerProps {
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    return () => {
      reader.reset();
    };
  }, []);

  const startScanning = async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      setIsScanning(true);
      
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current);
      
      if (result) {
        setScannedData(result.getText());
        await handleAttendance(result.getText());
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  const handleAttendance = async (qrData: string) => {
    if (!user) return;

    try {
      // Parse QR data to get lesson ID
      const lessonData = JSON.parse(qrData);
      const lessonId = lessonData.lessonId;

      // Check if lesson exists and is active
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('qr_code', qrData)
        .maybeSingle();

      if (lessonError || !lesson) {
        throw new Error('Invalid or expired QR code');
      }

      // Check if already marked attendance
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .maybeSingle();

      if (existingAttendance) {
        toast({
          title: "Already Marked",
          description: "You have already marked attendance for this lesson.",
          variant: "destructive"
        });
        return;
      }

      // Mark attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          lesson_id: lessonId,
          student_id: user.id,
          status: 'present',
          timestamp: new Date().toISOString()
        });

      if (attendanceError) throw attendanceError;

      toast({
        title: "Attendance Marked!",
        description: `Successfully marked attendance for ${lesson.title}`,
      });

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Scan QR Code</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!scannedData ? (
            <Card className="p-4">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Button onClick={startScanning} size="lg">
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute inset-4 border-2 border-primary border-dashed rounded-lg">
                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Position the QR code within the frame to scan
              </p>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Success!</h3>
              <p className="text-muted-foreground">
                Attendance marked successfully. This dialog will close automatically.
              </p>
            </Card>
          )}

          <div className="flex space-x-2">
            {isScanning && (
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                Stop Scanning
              </Button>
            )}
            <Button onClick={onClose} variant="outline" className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};