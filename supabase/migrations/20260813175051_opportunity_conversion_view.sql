-- Opportunity Conversion Rate, grouped by organization: the share of
-- "engaged" participants who go on to secure (or self-create and launch)
-- an opportunity. Built to be shown directly to an org or a funder.
--
-- Definitions (see commit/PR discussion for the reasoning):
--
--   Engaged participant = has an impact_baselines row for the org
--   (formally enrolled) AND at least one recorded interaction after that:
--   an impact_events row, an impact_opportunities row, or a completed
--   impact_checkpoints row, dated on/after their baseline capture. This
--   excludes people who enrolled but never engaged with the program again.
--
--   Reached a secured opportunity = at least one impact_opportunities row
--   with status = 'secured', of any type (job/scholarship/funding/
--   self_created) - self_created opportunities go through the same
--   surfaced -> pursued -> secured lifecycle as the others.
--
-- The numerator is constructed as a strict subset of the denominator (only
-- secured opportunities among already-engaged participants count), so the
-- rate can never exceed 100%.
--
-- Minimum sample size: opportunity_conversion_rate_pct is suppressed
-- (NULL) whenever engaged_participants < 10 - a rate computed on a
-- handful of people is statistically meaningless and shouldn't be
-- presented as one. The raw engaged_participants and
-- participants_with_secured_opportunity counts are always shown either
-- way, and sufficient_sample_size makes explicit *why* the rate is
-- missing, so a NULL here doesn't get misread as a data/query problem.
--
-- SECURITY INVOKER: views run with the owner's privileges by default,
-- which would bypass every RLS policy on the underlying tables and let
-- anyone who can query the view see every organization's numbers. This is
-- created with security_invoker = true so it enforces the same per-org
-- RLS as impact_baselines/impact_events/impact_opportunities/organizations
-- - an org owner querying it sees only their own org's row, admin sees all.

CREATE OR REPLACE VIEW "public"."impact_opportunity_conversion"
    WITH (security_invoker = true) AS
WITH "engaged_participants" AS (
    SELECT DISTINCT "b"."organization_id", "b"."user_id"
    FROM "public"."impact_baselines" "b"
    WHERE EXISTS (
        SELECT 1 FROM "public"."impact_events" "e"
        WHERE "e"."organization_id" = "b"."organization_id"
          AND "e"."user_id" = "b"."user_id"
          AND "e"."occurred_at" >= "b"."captured_at"
    )
    OR EXISTS (
        SELECT 1 FROM "public"."impact_opportunities" "o"
        WHERE "o"."organization_id" = "b"."organization_id"
          AND "o"."user_id" = "b"."user_id"
          AND "o"."surfaced_at" >= "b"."captured_at"
    )
    OR EXISTS (
        SELECT 1 FROM "public"."impact_checkpoints" "c"
        WHERE "c"."organization_id" = "b"."organization_id"
          AND "c"."user_id" = "b"."user_id"
          AND "c"."completed_at" IS NOT NULL
    )
),
"secured_opportunities" AS (
    SELECT DISTINCT "organization_id", "user_id"
    FROM "public"."impact_opportunities"
    WHERE "status" = 'secured'
)
SELECT
    "org"."id" AS "organization_id",
    "org"."name" AS "organization_name",
    "org"."status" AS "organization_status",
    COUNT(DISTINCT "ep"."user_id") AS "engaged_participants",
    COUNT(DISTINCT "so"."user_id") AS "participants_with_secured_opportunity",
    COUNT(DISTINCT "ep"."user_id") >= 10 AS "sufficient_sample_size",
    CASE
        -- Suppressed below 10 engaged participants: too small a sample to
        -- present as a rate. Raw counts above are still always shown, so
        -- nothing is hidden - just the derived percentage.
        WHEN COUNT(DISTINCT "ep"."user_id") < 10 THEN NULL
        ELSE ROUND(
            COUNT(DISTINCT "so"."user_id")::numeric / COUNT(DISTINCT "ep"."user_id")::numeric * 100,
            1
        )
    END AS "opportunity_conversion_rate_pct"
FROM "public"."organizations" "org"
LEFT JOIN "engaged_participants" "ep" ON "ep"."organization_id" = "org"."id"
LEFT JOIN "secured_opportunities" "so"
    ON "so"."organization_id" = "ep"."organization_id"
   AND "so"."user_id" = "ep"."user_id"
GROUP BY "org"."id", "org"."name", "org"."status"
ORDER BY "org"."name";

ALTER VIEW "public"."impact_opportunity_conversion" OWNER TO "postgres";

GRANT SELECT ON "public"."impact_opportunity_conversion" TO "anon";
GRANT SELECT ON "public"."impact_opportunity_conversion" TO "authenticated";
GRANT SELECT ON "public"."impact_opportunity_conversion" TO "service_role";
