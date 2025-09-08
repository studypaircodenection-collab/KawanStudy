import { BookOpen, Github } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">StudyPair</span>
            </div>
            <p className="text-secondary-foreground/80 mb-4">
              Smart tutoring platform revolutionizing peer-to-peer learning for
              modern students.
            </p>
            <div className="flex space-x-4">
              <Github className="h-5 w-5 text-secondary-foreground/60 hover:text-secondary-foreground cursor-pointer" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-secondary-foreground/80">
              <li>
                <a href="#" className="hover:text-secondary-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-foreground">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-foreground">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8 text-center text-secondary-foreground/60">
          <p>
            &copy; 2025 StudyPair. All rights reserved. Built for CodeNection
            2025 Hackathon.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
