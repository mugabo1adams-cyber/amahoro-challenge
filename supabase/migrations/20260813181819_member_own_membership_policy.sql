-- Prerequisite for participant-facing impact intake: a member currently has
-- no way to discover which organization they belong to. organization_members
-- only has "Owners can view their org's members" (owner-scoped) - there is
-- no policy letting a member read their own row, so a participant's own
-- client can't learn their organization_id to attach a baseline/opportunity/
-- checkpoint to. This adds the same "own row" pattern already used
-- everywhere else in this schema (users, messages, progress, ...).
--
-- Scope is deliberately narrow: SELECT only, and only the row where
-- user_id = auth.uid(). A member still cannot see their org's other
-- members, billing info, or anything beyond their own membership record.

CREATE POLICY "Users can view their own membership" ON "public"."organization_members" FOR SELECT USING (("auth"."uid"() = "user_id"));
