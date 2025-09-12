import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Download, Copy, X } from 'lucide-react';

interface QRGeneratorProps {
  onClose: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ onClose }) => {
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    lesson_date: new Date().toISOString().slice(0, 16)
  });
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateQRCode = async () => {
    if (!lessonData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a lesson title",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Create lesson in database
      const lessonId = crypto.randomUUID();
      const qrData = JSON.stringify({
        lessonId,
        title: lessonData.title,
        timestamp: new Date().toISOString()
      });

      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          id: lessonId,
          title: lessonData.title,
          description: lessonData.description,
          lesson_date: lessonData.lesson_date,
          teacher_id: user?.id,
          qr_code: qrData
        });

      if (lessonError) throw lessonError;

      setGeneratedQR(qrData);
      
      toast({
        title: "QR Code Generated!",
        description: "Students can now scan this QR code to mark attendance.",
      });

    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lessonData.title.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const copyQRData = () => {
    if (generatedQR) {
      navigator.clipboard.writeText(generatedQR);
      toast({
        title: "Copied!",
        description: "QR data copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Generate QR Code</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!generatedQR ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter lesson title"
                  value={lessonData.title}
                  onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter lesson description"
                  value={lessonData.description}
                  onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Lesson Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={lessonData.lesson_date}
                  onChange={(e) => setLessonData({ ...lessonData, lesson_date: e.target.value })}
                />
              </div>

              <Button 
                onClick={generateQRCode} 
                className="w-full" 
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <h3 className="text-lg font-semibold text-center">{lessonData.title}</h3>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG 
                      value={generatedQR}
                      size={200}
                      level="M"
                      includeMargin
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Students can scan this QR code to mark their attendance
                  </p>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={downloadQR} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={copyQRData} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Data
                </Button>
              </div>

              <Button onClick={() => setGeneratedQR(null)} className="w-full">
                Generate Another QR
              </Button>
            </div>
          )}

          <Button onClick={onClose} variant="outline" className="w-full">
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};