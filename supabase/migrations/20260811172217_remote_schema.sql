


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."enforce_seat_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  current_count int;
  max_seats int;
begin
  select seat_limit into max_seats from public.organizations where id = new.organization_id;
  select count(*) into current_count from public.organization_members where organization_id = new.organization_id;

  if current_count >= max_seats then
    raise exception 'Seat limit of % reached for this organization', max_seats;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_seat_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_signups"() RETURNS TABLE("id" "uuid", "email" "text", "created_at" timestamp with time zone, "last_sign_in_at" timestamp with time zone, "provider" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
begin
  if auth.jwt() ->> 'email' <> 'mugabo1adams@gmail.com' then
    raise exception 'not authorized';
  end if;

  return query
  select u.id, u.email, u.created_at, u.last_sign_in_at,
         (u.raw_app_meta_data ->> 'provider')::text as provider
  from auth.users u
  order by u.created_at desc;
end;
$$;


ALTER FUNCTION "public"."get_admin_signups"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_org_engagement_stats"("org_id" "uuid") RETURNS TABLE("total_members" integer, "active_this_week" integer, "completed_3plus_days" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  requester_id uuid;
begin
  select owner_id into requester_id from public.organizations where id = org_id;
  if requester_id is null or requester_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  return query
  select
    (select count(*)::int from public.organization_members where organization_id = org_id),
    (select count(distinct om.user_id)::int
       from public.organization_members om
       join public.messages m on m.user_id = om.user_id
       where om.organization_id = org_id and m.created_at > now() - interval '7 days'),
    (select count(*)::int from (
        select om.user_id
        from public.organization_members om
        join public.progress p on p.user_id = om.user_id
        where om.organization_id = org_id
        group by om.user_id
        having count(*) >= 3
     ) sub);
end;
$$;


ALTER FUNCTION "public"."get_org_engagement_stats"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_users_needing_nudge"() RETURNS TABLE("user_id" "uuid", "email" "text", "name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select u.id, u.email, u.name
  from public.users u
  join (
    select user_id, max(created_at) as last_msg
    from public.messages
    group by user_id
  ) m on m.user_id = u.id
  where m.last_msg < now() - interval '3 days'
    and m.last_msg > now() - interval '6 days'
    and (u.last_nudge_sent_at is null or u.last_nudge_sent_at < now() - interval '14 days');
$$;


ALTER FUNCTION "public"."get_users_needing_nudge"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_user_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform net.http_post(
    url := 'https://amahoro.app/api/webhooks/user-created',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-supabase-signature', '<REDACTED - see SUPABASE_WEBHOOK_SECRET env var, rotate before making this repo public>'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'users',
      'schema', 'public',
      'record', to_jsonb(NEW),
      'old_record', null
    )
  );
  return NEW;
end;
$$;


ALTER FUNCTION "public"."notify_user_created"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."generated_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "type" "text" NOT NULL,
    "label" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."generated_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "status" "text" DEFAULT 'invited'::"text" NOT NULL,
    "welcome_email_sent_at" timestamp with time zone,
    "invited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "joined_at" timestamp with time zone,
    CONSTRAINT "organization_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'member'::"text"]))),
    CONSTRAINT "organization_members_status_check" CHECK (("status" = ANY (ARRAY['invited'::"text", 'joined'::"text"])))
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "billing_cycle" "text" NOT NULL,
    "seat_limit" integer DEFAULT 30 NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "paystack_customer_code" "text",
    "paystack_subscription_code" "text",
    "paystack_plan_code" "text",
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizations_billing_cycle_check" CHECK (("billing_cycle" = ANY (ARRAY['monthly'::"text", 'annual'::"text"]))),
    CONSTRAINT "organizations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'past_due'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "plan" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "paystack_reference" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "billing_cycle" "text",
    "organization_id" "uuid",
    CONSTRAINT "payments_billing_cycle_check" CHECK (("billing_cycle" = ANY (ARRAY['monthly'::"text", 'annual'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "day_number" integer NOT NULL,
    "reflection" "text",
    "mahoro_response" "text",
    "completed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "country" "text" NOT NULL,
    "trigger_type" "text" NOT NULL,
    "goal" "text" NOT NULL,
    "is_pro" boolean DEFAULT false,
    "is_org" boolean DEFAULT false,
    "org_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_seen" timestamp with time zone DEFAULT "now"(),
    "welcome_email_sent_at" timestamp with time zone,
    "paystack_subscription_code" "text",
    "pro_activated_email_sent_at" timestamp with time zone,
    "last_nudge_sent_at" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "generated_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_email_key" UNIQUE ("organization_id", "email");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_user_id_day_number_key" UNIQUE ("user_id", "day_number");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "trg_enforce_seat_limit" BEFORE INSERT ON "public"."organization_members" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_seat_limit"();



CREATE OR REPLACE TRIGGER "trg_notify_user_created" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."notify_user_created"();



ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "generated_content_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "generated_content_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin can view all generated content" ON "public"."generated_content" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));



CREATE POLICY "Admin can view all messages" ON "public"."messages" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));



CREATE POLICY "Admin can view all payments" ON "public"."payments" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));



CREATE POLICY "Admin can view all profiles" ON "public"."users" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));



CREATE POLICY "Admin can view all progress" ON "public"."progress" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));



CREATE POLICY "Admin read all messages" ON "public"."messages" FOR SELECT USING (true);



CREATE POLICY "Admin read all progress" ON "public"."progress" FOR SELECT USING (true);



CREATE POLICY "Messages insert own" ON "public"."messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Messages read own" ON "public"."messages" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Owners can view their org's members" ON "public"."organization_members" FOR SELECT USING (("organization_id" IN ( SELECT "organizations"."id"
   FROM "public"."organizations"
  WHERE ("organizations"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Owners can view their own organization" ON "public"."organizations" FOR SELECT USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Payments insert own" ON "public"."payments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Payments read own" ON "public"."payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Progress insert own" ON "public"."progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Progress read own" ON "public"."progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Progress update own" ON "public"."progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own generated content" ON "public"."generated_content" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own messages" ON "public"."messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own progress" ON "public"."progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own progress" ON "public"."progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own generated content" ON "public"."generated_content" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own messages" ON "public"."messages" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payments" ON "public"."payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own progress" ON "public"."progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users insert own" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users read own" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users update own" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."generated_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_seat_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_seat_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_seat_limit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_admin_signups"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_admin_signups"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_signups"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_org_engagement_stats"("org_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_org_engagement_stats"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_org_engagement_stats"("org_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_users_needing_nudge"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_users_needing_nudge"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_user_created"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_user_created"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_user_created"() TO "service_role";



GRANT ALL ON TABLE "public"."generated_content" TO "anon";
GRANT ALL ON TABLE "public"."generated_content" TO "authenticated";
GRANT ALL ON TABLE "public"."generated_content" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."progress" TO "anon";
GRANT ALL ON TABLE "public"."progress" TO "authenticated";
GRANT ALL ON TABLE "public"."progress" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







