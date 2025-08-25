import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicLibrary from "@/components/dashboard/past-year/public-library";
import UiTMLibrary from "@/components/dashboard/past-year/uitm-library";

const PastYearClientPage: React.FC = () => {
  return (
    <div className="container mx-auto">
      <Tabs defaultValue="uitm" className="w-full">
        <TabsList>
          <TabsTrigger value="uitm">UiTM Exam Paper</TabsTrigger>
          <TabsTrigger value="public">KawanStudy Library</TabsTrigger>
        </TabsList>
        <TabsContent value="public" className="mt-4">
          <PublicLibrary />
        </TabsContent>
        <TabsContent value="uitm" className="mt-4">
          <UiTMLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PastYearClientPage;
