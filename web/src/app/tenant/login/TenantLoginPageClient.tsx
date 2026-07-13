"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Lock, Mail, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const demoTenants = [
  { id: "waiting-1", label: "Farhan Aziz", email: "farhan.aziz@email.com", password: "tenant123", status: "Menunggu Bayar" },
  { id: "waiting-2", label: "Maya Sari", email: "maya.sari@email.com", password: "tenant123", status: "Menunggu Bayar" },
  { id: "paid-1", label: "Hendra Wijaya", email: "hendra.wijaya@email.com", password: "tenant123", status: "Siap Check-in" },
  { id: "paid-2", label: "Lisa Permata", email: "lisa.permata@email.com", password: "tenant123", status: "Siap Check-in" },
  { id: "checked-in-1", label: "Rizky Ramadhan", email: "rizky.ramadhan@email.com", password: "tenant123", status: "Checked In" },
  { id: "checked-in-2", label: "Putri Wulandari", email: "putri.wulandari@email.com", password: "tenant123", status: "Checked In" },
  { id: "checked-in-3", label: "Galang Ramadhan", email: "galang.ramadhan@email.com", password: "tenant123", status: "Checked In" },
];

interface TenantLoginPageClientProps {
  propertyName: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(error ? "Login gagal" : "");

  const handleDemoLogin = async (tenant: (typeof demoTenants)[0]) => {
    setLoading(true);
    setErrorMessage("");

    const result = await signIn("tenant", {
      email: tenant.email,
      password: tenant.password,
      redirect: false,
    });

    if (result?.error) {
      setErrorMessage("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/tenant");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const result = await signIn("tenant", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrorMessage("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/tenant");
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Masuk</CardTitle>
        <CardDescription className="text-center">
          Gunakan akun tenant untuk mengakses portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                placeholder="tenant@email.com"
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
        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">atau gunakan demo</span>
          </div>
        </div>

        {/* Status Groups */}
        <div className="space-y-4">
          {/* Menunggu Bayar */}
          <div>
            <p className="text-xs font-medium text-amber-600 mb-2 px-1">Menunggu Pembayaran</p>
            <div className="grid grid-cols-2 gap-2">
              {demoTenants.filter(t => t.status === "Menunggu Bayar").map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => handleDemoLogin(tenant)}
                  disabled={loading}
                  className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-all text-left group disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                    <UserCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{tenant.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{tenant.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Siap Check-in */}
          <div>
            <p className="text-xs font-medium text-blue-600 mb-2 px-1">Siap Check-in</p>
            <div className="grid grid-cols-2 gap-2">
              {demoTenants.filter(t => t.status === "Siap Check-in").map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => handleDemoLogin(tenant)}
                  disabled={loading}
                  className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left group disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <UserCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{tenant.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{tenant.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Checked In */}
          <div>
            <p className="text-xs font-medium text-emerald-600 mb-2 px-1">Checked In</p>
            <div className="grid grid-cols-2 gap-2">
              {demoTenants.filter(t => t.status === "Checked In").map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => handleDemoLogin(tenant)}
                  disabled={loading}
                  className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <UserCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{tenant.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{tenant.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TenantLoginPageClient({ propertyName }: TenantLoginPageClientProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Portal Tenant</h1>
              <p className="text-sm text-slate-500">{propertyName}</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<Card className="shadow-lg"><CardContent className="py-8 text-center">Memuat...</CardContent></Card>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
