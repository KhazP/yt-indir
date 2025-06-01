import { useState } from "react";
import { Card } from "@/components/ui/card";
import URLInput from "./url-input";
import QualitySelector from "./quality-selector";
import DownloadSection from "./download-section";
import { useDownload } from "@/hooks/use-download";
import { validateYouTubeUrl } from "@/lib/youtube-validator";
import { useToast } from "@/hooks/use-toast";

interface DownloadCardProps {
  onAgeGateRequired: (url: string, quality: string) => void;
  isDisclaimerAccepted: boolean;
}

export default function DownloadCard({ onAgeGateRequired, isDisclaimerAccepted }: DownloadCardProps) {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("");
  const { toast } = useToast();
  const { startDownload, isProcessing, progress, currentStep, cancel } = useDownload();

  const isValidUrl = validateYouTubeUrl(url);

  const handleDownload = async () => {
    if (!isDisclaimerAccepted) {
      toast({
        title: "Agreement Required",
        description: "Please accept the legal disclaimer first.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL first.",
        variant: "destructive",
      });
      return;
    }

    if (!quality) {
      toast({
        title: "Quality Required",
        description: "Please select a video quality.",
        variant: "destructive",
      });
      return;
    }

    // Check for age-restricted content (Rick Roll video as example)
    if (url.includes("dQw4w9WgXcQ")) {
      onAgeGateRequired(url, quality);
      return;
    }

    try {
      await startDownload(url, quality);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glassmorphism p-8 animate-fade-in">
      <URLInput
        value={url}
        onChange={setUrl}
        isValid={isValidUrl}
      />

      <QualitySelector
        value={quality}
        onChange={setQuality}
        disabled={!isValidUrl}
      />

      <DownloadSection
        onDownload={handleDownload}
        onCancel={cancel}
        isProcessing={isProcessing}
        progress={progress}
        currentStep={currentStep}
        canDownload={isValidUrl && !!quality && !isProcessing}
      />
    </Card>
  );
}
