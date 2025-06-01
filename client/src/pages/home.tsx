import { useState } from "react";
import { Youtube } from "lucide-react";
import DownloadCard from "@/components/download-card";
import LegalDisclaimerModal from "@/components/legal-disclaimer-modal";
import AgeGateModal from "@/components/age-gate-modal";
import FeaturesGrid from "@/components/features-grid";
import LegalFooter from "@/components/legal-footer";

export default function Home() {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(
    localStorage.getItem("yt-indir-disclaimer-accepted") === "true"
  );
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{ url: string; quality: string } | null>(null);

  const handleDisclaimerAccept = () => {
    localStorage.setItem("yt-indir-disclaimer-accepted", "true");
    setHasAcceptedDisclaimer(true);
  };

  const handleAgeGateRequired = (url: string, quality: string) => {
    setPendingDownload({ url, quality });
    setShowAgeGate(true);
  };

  const handleAgeConfirm = () => {
    setShowAgeGate(false);
    if (pendingDownload) {
      // Continue with download
      setPendingDownload(null);
    }
  };

  const handleAgeCancel = () => {
    setShowAgeGate(false);
    setPendingDownload(null);
  };

  return (
    <>
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-200/30 mb-4">
              <Youtube className="text-red-500 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">YT-Indir</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Fast, secure YouTube video downloader with no data retention
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <DownloadCard 
            onAgeGateRequired={handleAgeGateRequired}
            isDisclaimerAccepted={hasAcceptedDisclaimer}
          />
          <FeaturesGrid />
          <LegalFooter />
        </div>
      </main>

      {/* Modals */}
      <LegalDisclaimerModal
        isOpen={!hasAcceptedDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={() => window.location.href = "https://youtube.com"}
      />

      <AgeGateModal
        isOpen={showAgeGate}
        onConfirm={handleAgeConfirm}
        onCancel={handleAgeCancel}
      />
    </>
  );
}
