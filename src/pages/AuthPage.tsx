import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

type FormData = {
  email: string;
  password: string;
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen">
      {/* Left side - Brand section */}
      <div className="flex w-1/2 bg-pink-50 border-r border-pink-200">
        <div className="flex flex-col items-center justify-between w-full p-8">
          <div className="flex h-full flex-col items-center justify-center">
            <img 
              src="src/art/brain-dump-icon.png" 
              alt="Logo" 
              className="w-[128px] h-[128px]" 
            /> 
            <div className="text-[32px] font-semibold text-pink-800 text-center w-full mt-4 mb-[2px] nunito-title leading-none tracking-wider">
              BrainDump
            </div>
            <p className="text-l text-pink-600 text-center tracking-wide">
              Your mind. Decluttered.
            </p>
          </div>     
          <p className="text-sm text-pink-400 text-center">
            BrainDump v0.1a - Shane Turner © 2025
          </p>
        </div>
      </div>

      {/* Right side - Auth form section */}
      <div className="flex w-1/2 bg-white">
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold mb-1">
                {isLogin ? "Sign in" : "Create account"}
              </h1>
              <p className="text-slate-500">
                {isLogin
                  ? "Enter your credentials to access your tasks."
                  : "Create a new account to start managing your tasks."}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
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
                    <FormItem className="space-y-1">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="••••••••" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : (isLogin ? "Sign in" : "Create account")}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="px-0"
                disabled={isLoading}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
