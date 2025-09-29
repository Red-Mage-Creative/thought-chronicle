import { ThoughtManagementPage } from "@/components/layout/ThoughtManagementPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";

const Index = () => {
  const [defaultTags, setDefaultTags] = useState<string[]>([]);

  return (
    <MainLayout>
      <ThoughtManagementPage
        defaultTags={defaultTags}
        onDefaultTagsChange={setDefaultTags}
      />
    </MainLayout>
  );
};

export default Index;
