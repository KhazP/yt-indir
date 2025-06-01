import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Eye, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPreviewProps {
  url: string;
  isValid: boolean;
}

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  viewCount?: string;
  uploadDate?: string;
  availableQualities: string[];
  isAgeRestricted: boolean;
}

export default function VideoPreview({ url, isValid }: VideoPreviewProps) {
  const { data: videoInfo, isLoading, error } = useQuery<VideoInfo>({
    queryKey: ['/api/video-info', url],
    enabled: !!url && isValid,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!url || !isValid) return null;

  if (error) {
    return (
      <Card className="glassmorphism mt-4 p-4">
        <CardContent className="p-0">
          <div className="text-sm text-red-600 dark:text-red-400">
            Unable to fetch video information. Please verify the URL is accessible.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="glassmorphism mt-4 p-4">
        <CardContent className="p-0">
          <div className="flex space-x-4">
            <Skeleton className="w-24 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!videoInfo) return null;

  return (
    <Card className="glassmorphism mt-4 p-4 animate-fade-in">
      <CardContent className="p-0">
        <div className="flex space-x-4">
          <img 
            src={videoInfo.thumbnail} 
            alt="Video thumbnail"
            className="w-24 h-16 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im04IDEyIDQgLTMuNSA0IDMuNSAtOCAweiIgZmlsbD0iIzY5NzI4MCIvPgo8L3N2Zz4K';
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2">
              {videoInfo.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {videoInfo.duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{videoInfo.duration}</span>
                </div>
              )}
              
              {videoInfo.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{videoInfo.viewCount}</span>
                </div>
              )}
              
              {videoInfo.uploadDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{videoInfo.uploadDate}</span>
                </div>
              )}
            </div>

            {videoInfo.isAgeRestricted && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                Age restricted content
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}