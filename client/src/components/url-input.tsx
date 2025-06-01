import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { validateYouTubeUrl } from "@/lib/youtube-validator";
import { useToast } from "@/hooks/use-toast";

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean | null;
}

export default function URLInput({ value, onChange, isValid }: URLInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    onChange(newValue);

    if (newValue) {
      setIsValidating(true);
      setTimeout(() => {
        setIsValidating(false);
        const valid = validateYouTubeUrl(newValue);
        if (valid) {
          toast({
            title: "Valid URL",
            description: "YouTube URL detected successfully!",
          });
        } else if (newValue.length > 10) {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid YouTube URL.",
            variant: "destructive",
          });
        }
      }, 500);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = e.clipboardData.getData("text").trim();
    if (pastedUrl) {
      toast({
        title: "URL Detected",
        description: "Validating pasted URL...",
      });
    }
  };

  const getValidationIcon = () => {
    if (!value) return null;
    if (isValidating) return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    if (isValid) return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="mb-8">
      <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        <Link className="h-4 w-4 text-blue-500 mr-2" />
        YouTube Video URL
      </Label>
      
      <div className="relative">
        <Input
          type="url"
          placeholder="Paste your YouTube video URL here..."
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          className="w-full px-4 py-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm pr-12"
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {value && !isValid && !isValidating && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
          <XCircle className="h-4 w-4 mr-1" />
          Please enter a valid YouTube URL
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Supported formats: youtube.com/watch?v=... or youtu.be/...
      </div>
    </div>
  );
}
