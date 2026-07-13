import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "ADMIN" | "OWNER";
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "OWNER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "OWNER";
    id: string;
  }
}
