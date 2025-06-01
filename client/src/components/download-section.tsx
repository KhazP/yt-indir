import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, X, CheckCircle, Loader2 } from "lucide-react";

interface DownloadSectionProps {
  onDownload: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  canDownload: boolean;
}

const processingSteps = [
  { id: 'fetching', label: 'Fetching video information', icon: CheckCircle },
  { id: 'processing', label: 'Processing video stream', icon: Loader2 },
  { id: 'preparing', label: 'Preparing download', icon: null },
];

export default function DownloadSection({
  onDownload,
  onCancel,
  isProcessing,
  progress,
  currentStep,
  canDownload,
}: DownloadSectionProps) {
  if (!isProcessing) {
    return (
      <Button
        onClick={onDownload}
        disabled={!canDownload}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
      >
        <Download className="h-5 w-5" />
        <span>Download Video</span>
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>{currentStep}</span>
          <span>{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="w-full h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden"
        />
      </div>

      {/* Processing Steps */}
      <div className="space-y-2 text-sm">
        {processingSteps.map((step, index) => {
          const isCompleted = index < processingSteps.findIndex(s => s.id === currentStep?.split(' ')[0]?.toLowerCase()) + 1;
          const isCurrent = step.label.toLowerCase().includes(currentStep?.toLowerCase()?.split(' ')[0] || '');
          const isPending = !isCompleted && !isCurrent;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-900/20'
                  : isCurrent
                  ? 'bg-blue-50/50 dark:bg-blue-900/20'
                  : 'bg-white/30 dark:bg-slate-800/30 opacity-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isCurrent
                  ? 'bg-blue-500'
                  : 'border-2 border-gray-300 dark:border-gray-600'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : null}
              </div>
              <span className={`${
                isCompleted || isCurrent ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Cancel Button */}
      <Button
        onClick={onCancel}
        variant="outline"
        className="w-full mt-4 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100/70 dark:bg-slate-800/70 hover:bg-gray-200/70 dark:hover:bg-slate-700/70 rounded-xl font-medium transition-colors duration-200"
      >
        <X className="h-4 w-4 mr-2" />
        Cancel Download
      </Button>
    </div>
  );
}
