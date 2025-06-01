import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function LegalDisclaimerModal({ isOpen, onAccept, onDecline }: LegalDisclaimerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700/20 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mr-4">
              <Scale className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Legal Notice
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              <strong>Important:</strong> Only download videos you have permission to download. Respect copyright laws and YouTube's Terms of Service.
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Download only your own content or content with explicit permission</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>No data is stored permanently on our servers</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>All processing is done transiently</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
              By continuing, you acknowledge that you understand and agree to these terms.
            </p>
          </div>
        </DialogDescription>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
