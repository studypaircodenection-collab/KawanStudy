import React from "react";
import { BookOpen } from "lucide-react";

const PublicLibrary = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          KawanStudy Past Year Library
        </h1>
      </div>
    </div>
  );
};

export default PublicLibrary;
