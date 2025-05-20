import { useState, useEffect } from "react";
import { useAuth, registerPartnerSchema, registerBusinessSchema } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "@/components/ui/role-badge";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterPartnerData = z.infer<typeof registerPartnerSchema>;
type RegisterBusinessData = z.infer<typeof registerBusinessSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerPartnerMutation, registerBusinessMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [roleType, setRoleType] = useState<"partner" | "business">("partner");

  // Use useEffect for navigation to avoid React warnings
  useEffect(() => {
    if (user) {
      navigate(user.role === "partner" ? "/partner/dashboard" : "/business/dashboard");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Partner registration form
  const partnerRegisterForm = useForm<RegisterPartnerData>({
    resolver: zodResolver(registerPartnerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      age: undefined,
      gender: "",
      location: "",
      occupation: "",
      education: "",
    },
  });

  // Business registration form
  const businessRegisterForm = useForm<RegisterBusinessData>({
    resolver: zodResolver(registerBusinessSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      companyName: "",
      industry: "",
      size: "",
      website: "",
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onPartnerRegisterSubmit = (data: RegisterPartnerData) => {
    registerPartnerMutation.mutate(data);
  };

  const onBusinessRegisterSubmit = (data: RegisterBusinessData) => {
    registerBusinessMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary-50 p-3 rounded-full">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-center text-gray-800">Welcome back</h1>
                  <p className="text-center text-gray-500 mt-1">Login to access your account</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex space-x-4 mb-4">
                    <RoleBadge 
                      role="partner" 
                      active={roleType === "partner"} 
                      onClick={() => setRoleType("partner")}
                      className="flex-1 flex justify-center"
                    />
                    <RoleBadge 
                      role="business" 
                      active={roleType === "business"} 
                      onClick={() => setRoleType("business")}
                      className="flex-1 flex justify-center"
                    />
                  </div>
                </div>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                          <div className="flex justify-end mt-1">
                            <a href="#" className="text-sm text-primary hover:text-primary/90">Forgot password?</a>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
            
            {/* Sign Up Forms */}
            <TabsContent value="signup">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary-50 p-3 rounded-full">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-center text-gray-800">Create Account</h1>
                  <p className="text-center text-gray-500 mt-1">Sign up to join our platform</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex space-x-4 mb-4">
                    <RoleBadge 
                      role="partner" 
                      active={roleType === "partner"} 
                      onClick={() => setRoleType("partner")}
                      className="flex-1 flex justify-center"
                    />
                    <RoleBadge 
                      role="business" 
                      active={roleType === "business"} 
                      onClick={() => setRoleType("business")}
                      className="flex-1 flex justify-center"
                    />
                  </div>
                </div>
                
                {/* Partner Registration Form */}
                {roleType === "partner" && (
                  <Form {...partnerRegisterForm}>
                    <form onSubmit={partnerRegisterForm.handleSubmit(onPartnerRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={partnerRegisterForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerRegisterForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={partnerRegisterForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={partnerRegisterForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerRegisterForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <h3 className="font-medium pt-2">Profile Information (Optional)</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={partnerRegisterForm.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerRegisterForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <FormControl>
                                <Input placeholder="Male, Female, Other" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={partnerRegisterForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerPartnerMutation.isPending}
                      >
                        {registerPartnerMutation.isPending ? "Creating Account..." : "Create Partner Account"}
                      </Button>
                    </form>
                  </Form>
                )}
                
                {/* Business Registration Form */}
                {roleType === "business" && (
                  <Form {...businessRegisterForm}>
                    <form onSubmit={businessRegisterForm.handleSubmit(onBusinessRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={businessRegisterForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={businessRegisterForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={businessRegisterForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={businessRegisterForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Inc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={businessRegisterForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={businessRegisterForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <h3 className="font-medium pt-2">Company Information (Optional)</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={businessRegisterForm.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <FormControl>
                                <Input placeholder="Technology, Retail, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={businessRegisterForm.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Size</FormLabel>
                              <FormControl>
                                <Input placeholder="1-10, 11-50, 51-200, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={businessRegisterForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerBusinessMutation.isPending}
                      >
                        {registerBusinessMutation.isPending ? "Creating Account..." : "Create Business Account"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
        
        <p className="text-center text-gray-500 text-sm">
          {activeTab === "login" ? (
            <>Don't have an account? <a href="#" onClick={() => setActiveTab("signup")} className="text-primary hover:text-primary/90">Sign up</a></>
          ) : (
            <>Already have an account? <a href="#" onClick={() => setActiveTab("login")} className="text-primary hover:text-primary/90">Login</a></>
          )}
        </p>
      </div>
    </div>
  );
}
