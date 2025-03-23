
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { 
  Wrench, 
  MapPin, 
  List, 
  FileText, 
  Shield, 
  Search,
  LayoutDashboard,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const navigate = useNavigate();

  const featureCards = [
    {
      icon: <Wrench className="h-8 w-8 text-primary" />,
      title: "Tools Managed",
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: "Storage Locations",
    },
    {
      icon: <List className="h-8 w-8 text-primary" />,
      title: "Active Projects",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Tool Manuals",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Tools Under Warranty",
    },
  ];

  const detailedFeatures = [
    {
      icon: <Wrench className="h-12 w-12 text-primary mb-4" />,
      title: "Tool Management",
      description: "Efficiently track and manage your tools with detailed information about location, status, and maintenance.",
    },
    {
      icon: <MapPin className="h-12 w-12 text-primary mb-4" />,
      title: "Visual Storage",
      description: "Create a visual map of your tool storage with photos and annotations for easy location tracking.",
    },
    {
      icon: <List className="h-12 w-12 text-primary mb-4" />,
      title: "Project Tracking",
      description: "Keep track of your DIY projects, including required tools, materials, and progress updates.",
    },
    {
      icon: <Shield className="h-12 w-12 text-primary mb-4" />,
      title: "Warranty Tracking",
      description: "Never miss a warranty claim with automated tracking of warranty periods and documentation.",
    },
    {
      icon: <Search className="h-12 w-12 text-primary mb-4" />,
      title: "Tool Guru",
      description: "Get AI-powered assistance for tool recommendations, usage tips, and maintenance guidance.",
    },
    {
      icon: <LayoutDashboard className="h-12 w-12 text-primary mb-4" />,
      title: "Project Helper",
      description: "Receive AI assistance for project planning, timeline estimates, and best practices.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0d1a] text-white flex flex-col">
      <main className="flex-1 container mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to ToolTrackerHub</h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8">
            The smart way to manage your tools, manuals, and DIY projects
          </p>
          <Button 
            size="lg" 
            className="font-semibold px-8"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </div>

        {/* Simple feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
          {featureCards.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center justify-center p-6 bg-[#1e2030] border-[#2a2c42]">
              {feature.icon}
              <h3 className="mt-3 text-sm sm:text-base font-medium">{feature.title}</h3>
            </Card>
          ))}
        </div>

        {/* Detailed feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {detailedFeatures.slice(0, 3).map((feature, index) => (
            <Card key={index} className="p-6 bg-[#1e2030] border-[#2a2c42]">
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </Card>
          ))}
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {detailedFeatures.slice(3).map((feature, index) => (
            <Card key={index} className="p-6 bg-[#1e2030] border-[#2a2c42]">
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Contact section */}
        <div className="flex justify-center mt-8">
          <Card className="inline-flex items-center p-4 bg-[#1e2030] border-[#2a2c42]">
            <Mail className="h-5 w-5 text-primary mr-2" />
            <span className="text-gray-300">contact@tooltrackerhub.com</span>
          </Card>
        </div>
      </main>
    </div>
  );
}
