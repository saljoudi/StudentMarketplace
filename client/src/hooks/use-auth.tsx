import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerPartnerMutation: UseMutationResult<SelectUser, Error, RegisterPartnerData>;
  registerBusinessMutation: UseMutationResult<SelectUser, Error, RegisterBusinessData>;
};

type LoginData = {
  username: string;
  password: string;
};

// Extended schema for partner registration with profile data
const registerPartnerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string(),
    age: z.number().optional(),
    gender: z.string().optional(),
    location: z.string().optional(),
    occupation: z.string().optional(),
    education: z.string().optional()
  })
  .omit({ role: true }) // We'll set this automatically
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Extended schema for business registration with profile data
const registerBusinessSchema = insertUserSchema
  .extend({
    confirmPassword: z.string(),
    companyName: z.string().min(1, "Company name is required"),
    industry: z.string().optional(),
    size: z.string().optional(),
    website: z.string().url().optional().or(z.literal(''))
  })
  .omit({ role: true }) // We'll set this automatically
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterPartnerData = z.infer<typeof registerPartnerSchema>;
type RegisterBusinessData = z.infer<typeof registerBusinessSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerPartnerMutation = useMutation({
    mutationFn: async (data: RegisterPartnerData) => {
      // Add the role
      const userData = {
        ...data,
        role: 'partner' as const
      };
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your partner account has been created!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerBusinessMutation = useMutation({
    mutationFn: async (data: RegisterBusinessData) => {
      // Add the role
      const userData = {
        ...data,
        role: 'business' as const
      };
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your business account has been created!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerPartnerMutation,
        registerBusinessMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { registerPartnerSchema, registerBusinessSchema };
