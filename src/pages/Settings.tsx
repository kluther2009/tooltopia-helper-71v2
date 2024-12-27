import { Layout } from "@/components/Layout";
import { Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { DeleteDataSection } from "@/components/settings/DeleteDataSection";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleSettingChange = (setting: string, value: boolean | string) => {
    switch (setting) {
      case "emailNotifications":
        setEmailNotifications(value as boolean);
        toast.success("Notification preferences updated");
        break;
      case "language":
        setLanguage(value as string);
        toast.success("Language preference updated");
        break;
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true);
      
      // Delete all user data (cascade delete will handle related records)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (profileError) throw profileError;

      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success("All data has been deleted successfully");
      navigate("/login");
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error("Failed to delete data. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          <NotificationsSection 
            emailNotifications={emailNotifications}
            onSettingChange={handleSettingChange}
          />
          
          <LanguageSection 
            language={language}
            onSettingChange={handleSettingChange}
          />
          
          <DeleteDataSection 
            isDeleting={isDeleting}
            onDelete={handleDeleteAllData}
          />
        </div>
      </div>
    </Layout>
  );
}