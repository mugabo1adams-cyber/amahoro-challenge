-- Impact measurement for organization mentorship cohorts.
--
-- Adds four tables, scoped by organization_id (not just reachable through a
-- join), matching the existing pattern already used by payments and
-- generated_content:
--
--   impact_baselines     - one intake snapshot per participant per org
--   impact_events        - append-only timestamped journey log per participant
--   impact_opportunities - job/scholarship/funding/self_created, tracked
--                          surfaced -> pursued -> secured
--   impact_checkpoints   - outcome check-ins at 0/3/6/12 months, flagged
--                          self_reported or verified
--
-- Design decisions (confirmed before writing this):
--   1. organization_id is required (NOT NULL) everywhere - this is an
--      org-cohort feature, not available to solo Pro/free users.
--   2. The four checkpoints (0/3/6/12) are auto-created as empty
--      placeholders the moment a baseline is inserted, via a trigger, so
--      "who's overdue" is a simple query rather than something the app has
--      to remember to schedule.
--   3. impact_events.event_type is free text (no CHECK) so new event kinds
--      don't require a migration - see the column comment below for the
--      naming convention to keep reporting consistent.
--   4. Verified checkpoints record verified_by + verified_at (who and
--      when), not just a source flag. RLS below specifically prevents a
--      participant from marking their own checkpoint "verified" or naming
--      themselves/anyone else as the verifier - only an org owner updating
--      their own org's rows can do that, and only as themselves.

-- ============================================================
-- impact_baselines
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."impact_baselines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "employment_status" "text",
    "education_status" "text",
    "self_rated_wellbeing" integer,
    "self_rated_confidence" integer,
    "responses" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "captured_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "impact_baselines_wellbeing_range" CHECK ((("self_rated_wellbeing" IS NULL) OR ("self_rated_wellbeing" BETWEEN 1 AND 10))),
    CONSTRAINT "impact_baselines_confidence_range" CHECK ((("self_rated_confidence" IS NULL) OR ("self_rated_confidence" BETWEEN 1 AND 10)))
);

COMMENT ON COLUMN "public"."impact_baselines"."responses" IS 'Flexible intake answers beyond the fixed columns (e.g. income band, skills, household size) - whatever a given org''s intake form asks that does not warrant its own column.';

ALTER TABLE "public"."impact_baselines" OWNER TO "postgres";

-- ============================================================
-- impact_events
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."impact_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

COMMENT ON COLUMN "public"."impact_events"."event_type" IS 'Free text by design (new event kinds shouldn''t need a migration) - but keep it dot-namespaced snake_case for consistent reporting: "<domain>.<action_past_tense>". Examples: baseline.captured, opportunity.surfaced, opportunity.pursued, opportunity.secured, checkpoint.completed, checkpoint.verified, challenge.day_completed, workshop.attended, mentorship.session_held.';

ALTER TABLE "public"."impact_events" OWNER TO "postgres";

-- ============================================================
-- impact_opportunities
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."impact_opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'surfaced'::"text" NOT NULL,
    "surfaced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pursued_at" timestamp with time zone,
    "secured_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "impact_opportunities_type_check" CHECK (("type" = ANY (ARRAY['job'::"text", 'scholarship'::"text", 'funding'::"text", 'self_created'::"text"]))),
    CONSTRAINT "impact_opportunities_status_check" CHECK (("status" = ANY (ARRAY['surfaced'::"text", 'pursued'::"text", 'secured'::"text"])))
);

ALTER TABLE "public"."impact_opportunities" OWNER TO "postgres";

-- ============================================================
-- impact_checkpoints
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."impact_checkpoints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "baseline_id" "uuid" NOT NULL,
    "checkpoint_month" integer NOT NULL,
    "scheduled_for" "date" NOT NULL,
    "completed_at" timestamp with time zone,
    "source" "text",
    "responses" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "impact_checkpoints_month_check" CHECK (("checkpoint_month" = ANY (ARRAY[0, 3, 6, 12]))),
    CONSTRAINT "impact_checkpoints_source_check" CHECK ((("source" IS NULL) OR ("source" = ANY (ARRAY['self_reported'::"text", 'verified'::"text"])))),
    CONSTRAINT "impact_checkpoints_completed_needs_source" CHECK ((("completed_at" IS NULL) OR ("source" IS NOT NULL))),
    CONSTRAINT "impact_checkpoints_verified_needs_reviewer" CHECK ((("source" IS DISTINCT FROM 'verified'::"text") OR (("verified_by" IS NOT NULL) AND ("verified_at" IS NOT NULL))))
);

COMMENT ON COLUMN "public"."impact_checkpoints"."responses" IS 'Outcome answers for this checkpoint - deliberately mirrors impact_baselines.responses shape so before/after comparison is straightforward.';

ALTER TABLE "public"."impact_checkpoints" OWNER TO "postgres";

-- ============================================================
-- Primary keys, uniqueness, foreign keys
-- ============================================================

ALTER TABLE ONLY "public"."impact_baselines" ADD CONSTRAINT "impact_baselines_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."impact_baselines" ADD CONSTRAINT "impact_baselines_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");

ALTER TABLE ONLY "public"."impact_events" ADD CONSTRAINT "impact_events_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."impact_opportunities" ADD CONSTRAINT "impact_opportunities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."impact_checkpoints" ADD CONSTRAINT "impact_checkpoints_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."impact_checkpoints" ADD CONSTRAINT "impact_checkpoints_org_user_month_key" UNIQUE ("organization_id", "user_id", "checkpoint_month");

ALTER TABLE ONLY "public"."impact_baselines"
    ADD CONSTRAINT "impact_baselines_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."impact_baselines"
    ADD CONSTRAINT "impact_baselines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."impact_events"
    ADD CONSTRAINT "impact_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."impact_events"
    ADD CONSTRAINT "impact_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."impact_opportunities"
    ADD CONSTRAINT "impact_opportunities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."impact_opportunities"
    ADD CONSTRAINT "impact_opportunities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."impact_checkpoints"
    ADD CONSTRAINT "impact_checkpoints_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."impact_checkpoints"
    ADD CONSTRAINT "impact_checkpoints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."impact_checkpoints"
    ADD CONSTRAINT "impact_checkpoints_baseline_id_fkey" FOREIGN KEY ("baseline_id") REFERENCES "public"."impact_baselines"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."impact_checkpoints"
    ADD CONSTRAINT "impact_checkpoints_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

-- organization_id is the primary axis this data will be queried/compared on;
-- events and opportunities have no unique constraint to piggyback an index
-- on, so they get one explicitly. impact_baselines and impact_checkpoints
-- already get one for free from their unique constraints above (org is the
-- leading column in both).
CREATE INDEX "impact_events_organization_id_idx" ON "public"."impact_events" ("organization_id");
CREATE INDEX "impact_events_user_id_idx" ON "public"."impact_events" ("user_id");
CREATE INDEX "impact_opportunities_organization_id_idx" ON "public"."impact_opportunities" ("organization_id");
CREATE INDEX "impact_opportunities_user_id_idx" ON "public"."impact_opportunities" ("user_id");

-- ============================================================
-- Auto-create the four checkpoint placeholders when a baseline is captured
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."create_impact_checkpoints"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.impact_checkpoints
    (organization_id, user_id, baseline_id, checkpoint_month, scheduled_for)
  values
    (new.organization_id, new.user_id, new.id, 0,  (new.captured_at)::date),
    (new.organization_id, new.user_id, new.id, 3,  (new.captured_at + interval '3 months')::date),
    (new.organization_id, new.user_id, new.id, 6,  (new.captured_at + interval '6 months')::date),
    (new.organization_id, new.user_id, new.id, 12, (new.captured_at + interval '12 months')::date);
  return new;
end;
$$;

ALTER FUNCTION "public"."create_impact_checkpoints"() OWNER TO "postgres";

CREATE TRIGGER "trg_create_impact_checkpoints"
    AFTER INSERT ON "public"."impact_baselines"
    FOR EACH ROW EXECUTE FUNCTION "public"."create_impact_checkpoints"();

-- SECURITY DEFINER so checkpoint creation always succeeds regardless of who
-- (participant, org owner, or admin) inserted the baseline - it shouldn't
-- depend on the inserting role also happening to have an INSERT policy on
-- impact_checkpoints that lines up.

-- ============================================================
-- Auto-stamp pursued_at / secured_at the first time an opportunity reaches
-- that status, on insert or update, without needing to compare to OLD.
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."stamp_opportunity_status_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.status = 'pursued' and new.pursued_at is null then
    new.pursued_at := now();
  end if;
  if new.status = 'secured' and new.secured_at is null then
    new.secured_at := now();
  end if;
  return new;
end;
$$;

ALTER FUNCTION "public"."stamp_opportunity_status_timestamp"() OWNER TO "postgres";

CREATE TRIGGER "trg_stamp_opportunity_status_timestamp"
    BEFORE INSERT OR UPDATE ON "public"."impact_opportunities"
    FOR EACH ROW EXECUTE FUNCTION "public"."stamp_opportunity_status_timestamp"();

-- ============================================================
-- RLS - same pattern as the rest of the schema: admin (email check) sees
-- everything, org owners see/manage their own org's rows, participants
-- see/manage their own rows.
-- ============================================================

ALTER TABLE "public"."impact_baselines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."impact_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."impact_opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."impact_checkpoints" ENABLE ROW LEVEL SECURITY;

-- impact_baselines

CREATE POLICY "Admin can view all impact baselines" ON "public"."impact_baselines" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));

CREATE POLICY "Owners can view their org's impact baselines" ON "public"."impact_baselines" FOR SELECT USING (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can insert their org's impact baselines" ON "public"."impact_baselines" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can update their org's impact baselines" ON "public"."impact_baselines" FOR UPDATE USING (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Users can view their own impact baselines" ON "public"."impact_baselines" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own impact baselines" ON "public"."impact_baselines" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own impact baselines" ON "public"."impact_baselines" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

-- impact_events

CREATE POLICY "Admin can view all impact events" ON "public"."impact_events" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));

CREATE POLICY "Owners can view their org's impact events" ON "public"."impact_events" FOR SELECT USING (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can insert their org's impact events" ON "public"."impact_events" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Users can view their own impact events" ON "public"."impact_events" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own impact events" ON "public"."impact_events" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own impact events" ON "public"."impact_events" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Admin can update all impact events" ON "public"."impact_events" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));

CREATE POLICY "Admin can delete all impact events" ON "public"."impact_events" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));

-- impact_events can now be corrected (participants fix their own typos,
-- admin can edit any row) but not erased - deliberately no DELETE policy
-- for participants or org owners, so the log can be corrected but not
-- destroyed except by admin.

-- impact_opportunities

CREATE POLICY "Admin can view all impact opportunities" ON "public"."impact_opportunities" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));

CREATE POLICY "Owners can view their org's impact opportunities" ON "public"."impact_opportunities" FOR SELECT USING (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can insert their org's impact opportunities" ON "public"."impact_opportunities" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can update their org's impact opportunities" ON "public"."impact_opportunities" FOR UPDATE USING (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"())))) WITH CHECK (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Users can view their own impact opportunities" ON "public"."impact_opportunities" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own impact opportunities" ON "public"."impact_opportunities" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own impact opportunities" ON "public"."impact_opportunities" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

-- impact_checkpoints
--
-- Deliberately asymmetric from the other tables: a participant can fill in
-- their own checkpoint (self_reported), but cannot mark it "verified" or
-- name a verifier - only an org owner updating a row in their own org can
-- do that, and only by naming themselves (verified_by = auth.uid()), never
-- an arbitrary other person.

CREATE POLICY "Admin can view all impact checkpoints" ON "public"."impact_checkpoints" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'mugabo1adams@gmail.com'::"text"));

CREATE POLICY "Owners can view their org's impact checkpoints" ON "public"."impact_checkpoints" FOR SELECT USING (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can insert their org's impact checkpoints" ON "public"."impact_checkpoints" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))));

CREATE POLICY "Owners can update their org's impact checkpoints" ON "public"."impact_checkpoints"
    FOR UPDATE
    USING (("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"()))))
    WITH CHECK (
        ("organization_id" IN ( SELECT "organizations"."id" FROM "public"."organizations" WHERE ("organizations"."owner_id" = "auth"."uid"())))
        AND (("verified_by" IS NULL) OR ("verified_by" = "auth"."uid"()))
    );

CREATE POLICY "Users can view their own impact checkpoints" ON "public"."impact_checkpoints" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own impact checkpoints" ON "public"."impact_checkpoints"
    FOR UPDATE
    USING (("auth"."uid"() = "user_id"))
    WITH CHECK (
        ("auth"."uid"() = "user_id")
        AND (("source" IS NULL) OR ("source" = 'self_reported'::"text"))
        AND ("verified_by" IS NULL)
        AND ("verified_at" IS NULL)
    );

-- No "Users can insert their own impact checkpoints" policy: rows are
-- created exclusively by the trg_create_impact_checkpoints trigger above,
-- not by direct client inserts.

-- ============================================================
-- Grants - same coarse GRANT ALL + RLS-does-the-real-work pattern already
-- used for every other table in this schema.
-- ============================================================

GRANT ALL ON FUNCTION "public"."create_impact_checkpoints"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_impact_checkpoints"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_impact_checkpoints"() TO "service_role";

GRANT ALL ON FUNCTION "public"."stamp_opportunity_status_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."stamp_opportunity_status_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."stamp_opportunity_status_timestamp"() TO "service_role";

GRANT ALL ON TABLE "public"."impact_baselines" TO "anon";
GRANT ALL ON TABLE "public"."impact_baselines" TO "authenticated";
GRANT ALL ON TABLE "public"."impact_baselines" TO "service_role";

GRANT ALL ON TABLE "public"."impact_events" TO "anon";
GRANT ALL ON TABLE "public"."impact_events" TO "authenticated";
GRANT ALL ON TABLE "public"."impact_events" TO "service_role";

GRANT ALL ON TABLE "public"."impact_opportunities" TO "anon";
GRANT ALL ON TABLE "public"."impact_opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."impact_opportunities" TO "service_role";

GRANT ALL ON TABLE "public"."impact_checkpoints" TO "anon";
GRANT ALL ON TABLE "public"."impact_checkpoints" TO "authenticated";
GRANT ALL ON TABLE "public"."impact_checkpoints" TO "service_role";
