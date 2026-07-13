graph TD
    prisma["prisma<br/>1 files"]
    src["src<br/>115 files"]
    src --> prisma

    subgraph External
        clsx(("clsx"))
        _base_ui_react(("@base-ui/react"))
        _supabase_supabase_js(("@supabase/supabase-js"))
        _auth_prisma_adapter(("@auth/prisma-adapter"))
        bcryptjs(("bcryptjs"))
    end