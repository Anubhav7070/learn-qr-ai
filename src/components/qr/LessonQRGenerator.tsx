import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Copy } from 'lucide-react';

interface LessonQRGeneratorProps {
  lessonId: string;
  lessonTitle: string;
  onQRGenerated?: (qrCode: string) => void;
}

export const LessonQRGenerator: React.FC<LessonQRGeneratorProps> = ({ 
  lessonId, 
  lessonTitle, 
  onQRGenerated 
}) => {
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    setIsGenerating(true);

    try {
      const qrData = JSON.stringify({
        lessonId,
        title: lessonTitle,
        timestamp: new Date().toISOString()
      });

      // Update lesson with QR code
      const { error } = await supabase
        .from('lessons')
        .update({ qr_code: qrData })
        .eq('id', lessonId);

      if (error) throw error;

      setGeneratedQR(qrData);
      onQRGenerated?.(qrData);
      
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
    const svg = document.querySelector('#lesson-qr-svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = 200;
        canvas.height = 200;
        ctx?.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${lessonTitle.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
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
    <div className="space-y-4">
      {!generatedQR ? (
        <Button 
          onClick={generateQRCode} 
          className="w-full" 
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </Button>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-lg font-semibold text-center">{lessonTitle}</h3>
                
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG 
                    id="lesson-qr-svg"
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
            </CardContent>
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
            Generate New QR
          </Button>
        </div>
      )}
    </div>
  );
};