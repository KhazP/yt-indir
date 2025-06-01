import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DownloadProgress {
  progress: number;
  status: string;
  currentStep: string;
}

export function useDownload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startDownload = async (url: string, quality: string) => {
    setIsProcessing(true);

    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${encodeURIComponent(quality)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Initiated",
        description: "Your browser will now download the video.",
      });
      
      setTimeout(() => {
        setIsProcessing(false);
      }, 3000);

    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not initiate download.",
        variant: "destructive",
      });
    }
  };

  const cancel = () => {
    setIsProcessing(false);
    toast({
      title: "Download Cancelled",
      description: "The download initiation has been stopped.",
    });
  };

  return {
    startDownload,
    cancel,
    isProcessing,
  };
}
