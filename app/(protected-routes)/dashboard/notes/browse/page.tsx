"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UiTMNotes from "@/components/notes/uitm-notes";
import KawanStudyNotes from "@/components/notes/kawanstudy-note";
const page = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <Tabs defaultValue="uitm" className="w-full">
          <TabsList>
            <TabsTrigger value="uitm">UiTM Notes</TabsTrigger>
            <TabsTrigger value="kawanstudy">KawanStudy Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="uitm" className="mt-4">
            <UiTMNotes />
          </TabsContent>
          <TabsContent value="kawanstudy" className="mt-4">
            <KawanStudyNotes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default page;
