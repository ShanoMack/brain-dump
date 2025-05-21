
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

type FormData = {
  email: string;
  password: string;
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectTo = location.state?.from || "/dashboard";

  const form = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const result = await signIn(data.email, data.password);
        if (result && result.user) {
          console.log("Login successful, redirecting to:", redirectTo);
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 500);
        }
      } else {
        const result = await signUp(data.email, data.password, data.email); // Using email as username
        if (result && result.user) {
          console.log("Registration successful, redirecting to dashboard");
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication error",
        description: error.message || "Failed to authenticate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-left justify-between bg-slate-50 px-4 py-4">
      <div className="flex flex-col items-center mt-4">
        <img src="src/art/brain-dump-icon.png" alt="Logo" className="w-[64px] h-[64px] mb-1" /> 
        <div className="text-3xl font-semibold text-slate-900 text-center w-full mb-[2px]">
            BrainDump
        </div>
        <p className="text-sm text-slate-500 text-center">
          The ultralight to-do list that just works.
        </p>
      </div>
      <div className="flex w-full justify-center">
        <Card className="w-full max-w-sm bg-white shadow-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your tasks."
                : "Create a new account to start managing your tasks."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" type="email" required {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : (isLogin ? "Sign in" : "Create account")}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="px-0"
              disabled={isLoading}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </CardFooter>
        </Card> 
      </div>      
      <p className="text-xs text-slate-400 text-center">
        BrainDump v0.1a - Shane Turner © 2025
      </p>
    </div>
  );
};

export default AuthPage;
