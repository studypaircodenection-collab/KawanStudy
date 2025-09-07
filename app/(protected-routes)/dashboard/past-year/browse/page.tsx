import { PaperBrowser } from "@/components/papers/paper-browser";

const BrowsePage = () => {
  return (
    <div className="container mx-auto py-6">
      <PaperBrowser showUploadButton={false} />
    </div>
  );
};

export default BrowsePage;
