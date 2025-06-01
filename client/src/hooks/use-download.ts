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
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const { toast } = useToast();

  const downloadMutation = useMutation({
    mutationFn: async ({ url, quality }: { url: string; quality: string }) => {
      const response = await apiRequest("POST", "/api/download", { url, quality });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Download Started",
        description: `Processing ${data.quality} video...`,
      });
      simulateProgress();
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to start download",
        variant: "destructive",
      });
    },
  });

  const simulateProgress = () => {
    const steps = [
      { step: "Fetching video information", progress: 25, duration: 1000 },
      { step: "Processing video stream", progress: 60, duration: 2000 },
      { step: "Preparing download", progress: 90, duration: 1500 },
      { step: "Download ready", progress: 100, duration: 500 },
    ];

    let currentIndex = 0;

    const processStep = () => {
      if (currentIndex >= steps.length) {
        completeDownload();
        return;
      }

      const step = steps[currentIndex];
      setCurrentStep(step.step);
      setProgress(step.progress);

      setTimeout(() => {
        currentIndex++;
        processStep();
      }, step.duration);
    };

    processStep();
  };

  const completeDownload = () => {
    toast({
      title: "Download Complete",
      description: "Your video is ready for download!",
    });

    // Simulate file download
    const link = document.createElement('a');
    link.href = '/api/download/file'; // This would be the actual file URL
    link.download = 'youtube_video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset state
    setTimeout(() => {
      setIsProcessing(false);
      setProgress(0);
      setCurrentStep("");
    }, 2000);
  };

  const startDownload = async (url: string, quality: string) => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep("Initializing...");
    
    await downloadMutation.mutateAsync({ url, quality });
  };

  const cancel = () => {
    setIsProcessing(false);
    setProgress(0);
    setCurrentStep("");
    toast({
      title: "Download Cancelled",
      description: "The download process has been stopped.",
    });
  };

  return {
    startDownload,
    cancel,
    isProcessing,
    progress,
    currentStep,
  };
}
