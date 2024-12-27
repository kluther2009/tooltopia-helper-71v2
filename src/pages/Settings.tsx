import { Layout } from "@/components/Layout";
import { DeleteDataSection } from "@/components/settings/DeleteDataSection";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";

export default function Settings() {
  return (
    <Layout>
      <div className="container max-w-4xl py-6 space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="space-y-6">
          <SubscriptionSection />
          <LanguageSection />
          <NotificationsSection />
          <DeleteDataSection />
        </div>
      </div>
    </Layout>
  );
}