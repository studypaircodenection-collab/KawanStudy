import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const toast = ({
  title,
  description,
  variant = "default",
}: ToastProps) => {
  if (variant === "destructive") {
    sonnerToast.error(title || description || "An error occurred");
  } else {
    sonnerToast.success(title || description || "Success");
  }
};

export const useToast = () => {
  return { toast };
};
