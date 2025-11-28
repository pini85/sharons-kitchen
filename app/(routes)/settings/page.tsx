import { getPreferences, updatePreferences } from "@/app/actions/preferences";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";

export default async function SettingsPage() {
  const result = await getPreferences();
  const preferences = result.success ? result.data : null;

  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <PreferencesForm initialData={preferences} />
      </PageContainer>
    </>
  );
}

