import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            adminType?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        adminType?: string;
        _id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        adminType?: string;
    }
}
