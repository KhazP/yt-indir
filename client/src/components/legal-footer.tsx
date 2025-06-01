import { Card, CardContent } from "@/components/ui/card";

export default function LegalFooter() {
  return (
    <footer className="mt-16 text-center">
      <Card className="glassmorphism p-6">
        <CardContent className="p-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong>Legal Notice:</strong> This tool is for downloading videos you own or have permission to download. 
            Please respect copyright laws and YouTube's Terms of Service.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              DMCA Policy
            </a>
          </div>
        </CardContent>
      </Card>
    </footer>
  );
}
