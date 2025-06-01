import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { qualityOptions } from "@shared/schema";

interface QualitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function QualitySelector({ value, onChange, disabled }: QualitySelectorProps) {
  const qualityLabels = {
    '1080p': '1080p Full HD (Recommended)',
    '720p': '720p HD',
    '480p': '480p Standard',
    '360p': '360p Mobile'
  };

  return (
    <div className="mb-8">
      <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        <Settings className="h-4 w-4 text-indigo-500 mr-2" />
        Video Quality
      </Label>
      
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full px-4 py-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <SelectValue placeholder="Select video quality..." />
        </SelectTrigger>
        <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
          {qualityOptions.map((quality) => (
            <SelectItem key={quality} value={quality} className="text-sm">
              {qualityLabels[quality]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Higher quality = larger file size. Auto-fallback to lower quality if unavailable.
      </div>
    </div>
  );
}
