-- Corrects a bug introduced in 20260811173846_fix_rls_policies.sql.
--
-- That migration's WITH CHECK subquery used a bare "id" to try to reference
-- the row being updated:
--
--   is_pro = ( SELECT u.is_pro FROM public.users u WHERE u.id = id )
--
-- Inside the subquery, "id" is ambiguous with the subquery's own "u.id" and
-- Postgres resolves it to the *inner* scope (u.id), not the outer row being
-- checked. That turned "WHERE u.id = id" into "WHERE u.id = u.id" — a
-- tautology matching every row in the table. On a table with more than one
-- user, a scalar subquery matching more than one row raises
-- "more than one row returned by a subquery used as an expression", which
-- means this policy has been rejecting *every* update to the users table
-- since it was applied, not just attempts to change is_pro/is_org.
--
-- The fix: qualify the outer reference with the real table name ("users"),
-- which is not bound inside the subquery (only "u" is), so it correctly
-- resolves to the outer row.

DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users update own" ON "public"."users";

CREATE POLICY "Users can update their own profile" ON "public"."users"
    FOR UPDATE
    USING ("auth"."uid"() = "id")
    WITH CHECK (
        "auth"."uid"() = "id"
        AND "is_pro" = ( SELECT "u"."is_pro" FROM "public"."users" "u" WHERE "u"."id" = "users"."id" )
        AND "is_org" = ( SELECT "u"."is_org" FROM "public"."users" "u" WHERE "u"."id" = "users"."id" )
    );

CREATE POLICY "Users update own" ON "public"."users"
    FOR UPDATE
    USING ("auth"."uid"() = "id")
    WITH CHECK (
        "auth"."uid"() = "id"
        AND "is_pro" = ( SELECT "u"."is_pro" FROM "public"."users" "u" WHERE "u"."id" = "users"."id" )
        AND "is_org" = ( SELECT "u"."is_org" FROM "public"."users" "u" WHERE "u"."id" = "users"."id" )
    );
