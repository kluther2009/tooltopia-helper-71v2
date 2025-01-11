import { useState } from "react";
import { DeleteDataSection } from "@/components/settings/DeleteDataSection";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = (setting: string, value: boolean | string) => {
    switch (setting) {
      case "language":
        setLanguage(value as string);
        break;
      case "emailNotifications":
        setEmailNotifications(value as boolean);
        break;
      default:
        break;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete user's tools
      await supabase.from("tools").delete().eq("user_id", user.id);
      
      // Delete user's photos
      await supabase.from("location_photos").delete().eq("user_id", user.id);
      
      // Delete user's projects
      await supabase.from("projects").delete().eq("user_id", user.id);

      toast({
        title: "Success",
        description: "All data has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete data. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="space-y-6">
          <LanguageSection 
            language={language}
            onSettingChange={handleSettingChange}
          />
          <NotificationsSection 
            emailNotifications={emailNotifications}
            onSettingChange={handleSettingChange}
          />
          <DeleteDataSection 
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />
        </div>
    </div>
  );
}
