import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AgeGateModal({ isOpen, onConfirm, onCancel }: AgeGateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700/20 rounded-2xl">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 w-8 h-8" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Age Restricted Content
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-center text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          This video may contain content inappropriate for users under 18. Please confirm your age to continue.
        </DialogDescription>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            I'm 18+
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
