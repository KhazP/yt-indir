import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Smartphone } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "No Data Storage",
    description: "All processing is done transiently. No videos or personal data stored on our servers.",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Powered by Cloudflare Workers for global edge processing and maximum speed.",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Responsive design that works perfectly on all devices with touch-friendly controls.",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export default function FeaturesGrid() {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index} className="glassmorphism p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardContent className="p-0">
            <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
              <feature.icon className={`${feature.iconColor} w-6 h-6`} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
