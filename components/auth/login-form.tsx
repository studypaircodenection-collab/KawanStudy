"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/auth-provider";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { passwordComplexity } from "@/lib/constant";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "invalid password")
    .regex(passwordComplexity, "invalid password"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setClaims } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    const supabase = createClient();
    setError(null);
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.getValues("email"),
        password: form.getValues("password"),
      });

      if (data.user) {
        console.log("User logged in:", data.user);

        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Set basic claims if profile fetch fails
          setClaims({
            sub: data.user.id,
            email: data.user.email || "",
            role: data.user.user_metadata?.role || "user",
          });
        } else {
          console.log("Profile data:", profile);
          // Set complete claims with profile data
          setClaims({
            sub: data.user.id,
            email: data.user.email || "",
            full_name: profile.full_name || "",
            username: profile.username || "",
            avatar_url: profile.avatar_url || "",
            role: data.user.user_metadata?.role || "user",
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          });
        }

        if (error) {
          setError(error.message);
        }
        // Get redirect URL from sear chParams or default to dashboard
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.push(redirectTo);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (e: React.FormEvent, provider: "google") => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const options: Record<
        string,
        string | number | boolean | object | null | undefined
      > = {
        redirectTo: `${window.location.origin}/auth/oauth?next=/dashboard`,
      };

      if (provider === "google") {
        options.queryParams = {
          access_type: "offline",
          prompt: "consent",
        };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex", className)} {...props}>
      <Card className="w-full max-w-sm border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="youremailaddress@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between items-center gap-2 flex-wrap">
                      Password
                      <Link
                        className="!text-primary hover:underline"
                        href="/auth/forgot-password"
                      >
                        Forgot password?
                      </Link>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
          <Separator className="my-3" />
          <div className="flex gap-2 items-center">
            <Button
              variant={"outline"}
              onClick={(e) => handleOAuthLogin(e, "google")}
              size={"lg"}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Logging in..." : "Google Login"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
