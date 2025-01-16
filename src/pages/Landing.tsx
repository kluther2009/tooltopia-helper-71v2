import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wrench,
  Settings,
  MapPin,
  FolderKanban,
  ClipboardList,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "Tool Inventory",
      description: "Track and manage your tools with ease",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location Tracking",
      description: "Know where every tool is at all times",
    },
    {
      icon: <FolderKanban className="h-6 w-6" />,
      title: "Project Management",
      description: "Plan and execute projects efficiently",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Document Management",
      description: "Store and access tool documentation",
    },
  ];

  const stats = [
    { value: "58", label: "Tools Managed" },
    { value: "3", label: "Active Projects" },
    { value: "3", label: "Warranty Items" },
    { value: "4", label: "Storage Locations" },
  ];

  const toolStatus = [
    { status: "Available", color: "bg-green-500" },
    { status: "In Use", color: "bg-red-500" },
    { status: "Maintenance", color: "bg-orange-500" },
    { status: "Loaned", color: "bg-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-card text-card-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white">
              ToolTracker<span className="text-primary">Hub</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Professional tool management system for organized efficiency
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="group"
              >
                Get Started
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center justify-center rounded-lg bg-card p-8 text-center ring-1 ring-white/10"
              >
                <dt className="text-sm font-semibold leading-6 text-gray-300">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-3xl font-bold tracking-tight text-white">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden p-6 hover:ring-2 hover:ring-primary/50 transition-all">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Status Section */}
      <section className="py-12 sm:py-16 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Visual Tool Status Tracking
            </h2>
            <p className="mt-4 text-gray-400">
              Monitor your tools with our intuitive color-coded system
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {toolStatus.map((status, index) => (
              <motion.div
                key={status.status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 rounded-lg bg-card p-4 ring-1 ring-white/10"
              >
                <div className={`h-3 w-3 rounded-full ${status.color}`} />
                <span className="text-sm font-medium text-white">
                  {status.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: <Wrench />, label: "Tool Overview", path: "/tool-overview" },
              {
                icon: <ClipboardList />,
                label: "Visual Inventory",
                path: "/initial-inventory",
              },
              {
                icon: <FolderKanban />,
                label: "Projects",
                path: "/projects",
              },
              { icon: <MapPin />, label: "Storage", path: "/storage" },
              { icon: <Settings />, label: "Settings", path: "/settings" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-white hover:text-primary hover:bg-primary/10"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Card className="overflow-hidden bg-primary/10 p-8 sm:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ready to get organized?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-gray-300">
                Start managing your tools efficiently with ToolTrackerHub
              </p>
              <div className="mt-10">
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="group"
                >
                  Get Started Now
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
