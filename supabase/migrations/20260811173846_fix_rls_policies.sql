-- Fix two RLS holes found while reviewing the pulled schema
-- (supabase/migrations/20260811172217_remote_schema.sql):
--
--   1. "Admin read all messages" / "Admin read all progress" were left with
--      USING (true) — no auth check at all. Since Postgres RLS policies are
--      OR'd together, these silently overrode the correctly-scoped "own
--      row" policies and let any authenticated user read every user's
--      private chat history and challenge reflections. The real,
--      email-checked admin policies ("Admin can view all messages" /
--      "Admin can view all progress") already cover the intended
--      admin-read use case, so these two are just dropped, not replaced.
--
--   2. The "own row" UPDATE policies on users only checked *which* row a
--      user could touch (auth.uid() = id), not *which columns*. That let
--      any logged-in user set is_pro / is_org on themselves directly via
--      the Supabase client, bypassing the Paystack payment flow entirely.
--      This adds a WITH CHECK that still lets users update their own
--      profile fields, but rejects the update if is_pro or is_org differs
--      from what's currently stored — those two columns can now only be
--      changed by the webhook (api/webhooks/paystack.js), which writes
--      with the service-role key and therefore bypasses RLS altogether.

-- 1. Drop the unscoped "read everything" policies.
DROP POLICY IF EXISTS "Admin read all messages" ON "public"."messages";
DROP POLICY IF EXISTS "Admin read all progress" ON "public"."progress";

-- 2. Re-create both "own row" update policies on users with a WITH CHECK
--    that pins is_pro / is_org to their existing stored values. The
--    subquery reads the pre-update row: Postgres evaluates WITH CHECK
--    against a snapshot taken before the current UPDATE statement made any
--    changes, so this reliably compares against the OLD value, not the one
--    being written.
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users update own" ON "public"."users";

CREATE POLICY "Users can update their own profile" ON "public"."users"
    FOR UPDATE
    USING ("auth"."uid"() = "id")
    WITH CHECK (
        "auth"."uid"() = "id"
        AND "is_pro" = ( SELECT "u"."is_pro" FROM "public"."users" "u" WHERE "u"."id" = "id" )
        AND "is_org" = ( SELECT "u"."is_org" FROM "public"."users" "u" WHERE "u"."id" = "id" )
    );

CREATE POLICY "Users update own" ON "public"."users"
    FOR UPDATE
    USING ("auth"."uid"() = "id")
    WITH CHECK (
        "auth"."uid"() = "id"
        AND "is_pro" = ( SELECT "u"."is_pro" FROM "public"."users" "u" WHERE "u"."id" = "id" )
        AND "is_org" = ( SELECT "u"."is_org" FROM "public"."users" "u" WHERE "u"."id" = "id" )
    );
