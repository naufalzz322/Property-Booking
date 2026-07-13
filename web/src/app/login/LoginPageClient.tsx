"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Lock, Mail, UserCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const demoUsers = [
  { id: "admin", label: "Admin", email: "admin@grahamaju.com", password: "admin123" },
  { id: "owner", label: "Owner", email: "owner@grahamaju.com", password: "owner123" },
];

interface LoginPageClientProps {
  propertyName: string;
}

function LoginContent({ propertyName }: { propertyName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(error ? "Invalid credentials" : "");

  const handleDemoLogin = (user: (typeof demoUsers)[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    // Auto-submit after selecting demo
    setTimeout(async () => {
      setLoading(true);
      const result = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });
      if (result?.error) {
        setErrorMessage("Email atau password salah");
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrorMessage("Email atau password salah");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Masuk</CardTitle>
        <CardDescription className="text-center">
          Gunakan akun admin untuk mengakses panel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memuat..." : "Masuk"}
          </Button>
        </form>

        {/* Demo Login Section */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">atau gunakan demo</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {demoUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleDemoLogin(user)}
              disabled={loading}
              className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-amber-300 transition-all text-left group disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <UserCircle className="w-5 h-5 text-slate-500 group-hover:text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{user.label}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPageClient({ propertyName }: LoginPageClientProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{propertyName}</h1>
              <p className="text-sm text-slate-500">Property Management</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<Card className="shadow-lg"><CardContent className="py-8 text-center">Memuat...</CardContent></Card>}>
          <LoginContent propertyName={propertyName} />
        </Suspense>
      </div>
    </div>
  );
}
