

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


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."increment_rate_limit"("key_param" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_record public.rate_limit;
BEGIN
    -- Get current rate limit record with FOR UPDATE to prevent race conditions
    SELECT * INTO current_record
    FROM public.rate_limit
    WHERE key = key_param
    FOR UPDATE;

    IF FOUND THEN
        -- Record exists, increment count
        UPDATE public.rate_limit
        SET count = count + 1,
            updated_at = timezone('utc'::text, now())
        WHERE key = key_param;
    ELSE
        -- Record doesn't exist, insert new one
        INSERT INTO public.rate_limit (key, count, reset_at)
        VALUES (
            key_param,
            1,
            timezone('utc'::text, now() + interval '1 hour')
        );
    END IF;
END;
$$;


ALTER FUNCTION "public"."increment_rate_limit"("key_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assessment_controls" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessment_id" "uuid",
    "control_id" "uuid",
    "status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "notes" "text",
    "assigned_to" "uuid",
    "due_date" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'implemented'::"text", 'not_applicable'::"text", 'not_compliant'::"text"])))
);


ALTER TABLE "public"."assessment_controls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "framework_id" "uuid",
    "start_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "end_date" timestamp with time zone,
    "status" "text" DEFAULT 'in_progress'::"text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['planned'::"text", 'in_progress'::"text", 'completed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "event_data" "text" NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_evidence" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "control_id" "uuid" NOT NULL,
    "evidence" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."compliance_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_frameworks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "version" "text" NOT NULL,
    "description" "text",
    "controls" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."compliance_frameworks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "framework_id" "uuid" NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "overall_score" integer NOT NULL,
    "control_scores" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "gaps_identified" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "recommendations" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "generated_date" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "compliance_reports_overall_score_check" CHECK ((("overall_score" >= 0) AND ("overall_score" <= 100)))
);


ALTER TABLE "public"."compliance_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."control_mappings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "control_id" "uuid" NOT NULL,
    "framework_id" "uuid" NOT NULL,
    "mapped_controls" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."control_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."controls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "framework_id" "uuid",
    "control_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'not_started'::"text",
    "implementation_status" "text" DEFAULT 'not_implemented'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    CONSTRAINT "controls_implementation_status_check" CHECK (("implementation_status" = ANY (ARRAY['not_implemented'::"text", 'partially_implemented'::"text", 'implemented'::"text"]))),
    CONSTRAINT "controls_status_check" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."controls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evidence" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessment_control_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "file_url" "text",
    "file_type" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "files" "jsonb" DEFAULT '[]'::"jsonb",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "notes" "text",
    "framework_id" "uuid" NOT NULL,
    "subcontrol_id" "text" NOT NULL
);


ALTER TABLE "public"."evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."frameworks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "version" "text",
    "description" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "slug" "text" NOT NULL,
    "categories" "text"[]
);


ALTER TABLE "public"."frameworks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "password_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."password_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limit" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "key" "text" NOT NULL,
    "count" integer DEFAULT 1,
    "reset_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."rate_limit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_alerts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" NOT NULL,
    "assigned_to" "uuid"[] DEFAULT '{}'::"uuid"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "security_alerts_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "security_alerts_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'resolved'::"text", 'closed'::"text"]))),
    CONSTRAINT "security_alerts_type_check" CHECK (("type" = ANY (ARRAY['security'::"text", 'compliance'::"text", 'info'::"text"])))
);


ALTER TABLE "public"."security_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subcontrols" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "control_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'not_started'::"text",
    "evidence" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subcontrols_status_check" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."subcontrols" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "due_date" timestamp with time zone NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text",
    "framework_id" "uuid",
    "control_id" "uuid",
    "assigned_to" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "tasks_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'overdue'::"text"])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_mfa" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "secret" "text" NOT NULL,
    "enabled" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."user_mfa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_organizations" (
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_organizations_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'auditor'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."user_organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."assessment_controls"
    ADD CONSTRAINT "assessment_controls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_evidence"
    ADD CONSTRAINT "compliance_evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_frameworks"
    ADD CONSTRAINT "compliance_frameworks_name_version_key" UNIQUE ("name", "version");



ALTER TABLE ONLY "public"."compliance_frameworks"
    ADD CONSTRAINT "compliance_frameworks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_reports"
    ADD CONSTRAINT "compliance_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."control_mappings"
    ADD CONSTRAINT "control_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."controls"
    ADD CONSTRAINT "controls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."frameworks"
    ADD CONSTRAINT "frameworks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."frameworks"
    ADD CONSTRAINT "frameworks_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_history"
    ADD CONSTRAINT "password_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limit"
    ADD CONSTRAINT "rate_limit_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."rate_limit"
    ADD CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_alerts"
    ADD CONSTRAINT "security_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subcontrols"
    ADD CONSTRAINT "subcontrols_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_mfa"
    ADD CONSTRAINT "user_mfa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_organizations"
    ADD CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("user_id", "organization_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_logs_event_type" ON "public"."audit_logs" USING "btree" ("event_type");



CREATE INDEX "idx_audit_logs_timestamp" ON "public"."audit_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_audit_logs_user_id" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_password_history_user_id" ON "public"."password_history" USING "btree" ("user_id");



CREATE INDEX "idx_rate_limit_key" ON "public"."rate_limit" USING "btree" ("key");



CREATE INDEX "idx_rate_limit_reset_at" ON "public"."rate_limit" USING "btree" ("reset_at");



CREATE INDEX "idx_user_mfa_user_id" ON "public"."user_mfa" USING "btree" ("user_id");



CREATE INDEX "rate_limit_key_idx" ON "public"."rate_limit" USING "btree" ("key");



CREATE OR REPLACE TRIGGER "update_assessments_updated_at" BEFORE UPDATE ON "public"."assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_compliance_evidence_updated_at" BEFORE UPDATE ON "public"."compliance_evidence" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_compliance_frameworks_updated_at" BEFORE UPDATE ON "public"."compliance_frameworks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_compliance_reports_updated_at" BEFORE UPDATE ON "public"."compliance_reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_control_mappings_updated_at" BEFORE UPDATE ON "public"."control_mappings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_security_alerts_updated_at" BEFORE UPDATE ON "public"."security_alerts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."assessment_controls"
    ADD CONSTRAINT "assessment_controls_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_controls"
    ADD CONSTRAINT "assessment_controls_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."compliance_evidence"
    ADD CONSTRAINT "compliance_evidence_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id");



ALTER TABLE ONLY "public"."compliance_reports"
    ADD CONSTRAINT "compliance_reports_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id");



ALTER TABLE ONLY "public"."compliance_reports"
    ADD CONSTRAINT "compliance_reports_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."compliance_frameworks"("id");



ALTER TABLE ONLY "public"."control_mappings"
    ADD CONSTRAINT "control_mappings_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."compliance_frameworks"("id");



ALTER TABLE ONLY "public"."controls"
    ADD CONSTRAINT "controls_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id");



ALTER TABLE ONLY "public"."controls"
    ADD CONSTRAINT "controls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_assessment_control_id_fkey" FOREIGN KEY ("assessment_control_id") REFERENCES "public"."assessment_controls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."evidence"
    ADD CONSTRAINT "evidence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."frameworks"
    ADD CONSTRAINT "frameworks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."password_history"
    ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subcontrols"
    ADD CONSTRAINT "subcontrols_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id");



ALTER TABLE ONLY "public"."user_mfa"
    ADD CONSTRAINT "user_mfa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_organizations"
    ADD CONSTRAINT "user_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_organizations"
    ADD CONSTRAINT "user_organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



CREATE POLICY "Allow anonymous read access" ON "public"."frameworks" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow authenticated insert" ON "public"."frameworks" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated update" ON "public"."frameworks" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can read all data" ON "public"."users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable delete access for organization admins" ON "public"."organizations" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organizations"
  WHERE (("user_organizations"."organization_id" = "organizations"."id") AND ("user_organizations"."user_id" = "auth"."uid"()) AND ("user_organizations"."role" = 'admin'::"text")))));



CREATE POLICY "Enable delete for evidence creators" ON "public"."evidence" FOR DELETE USING (("auth"."uid"() = "uploaded_by"));



CREATE POLICY "Enable delete for organization admins" ON "public"."user_organizations" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organizations" "admins"
  WHERE (("admins"."organization_id" = "user_organizations"."organization_id") AND ("admins"."user_id" = "auth"."uid"()) AND ("admins"."role" = 'admin'::"text")))));



CREATE POLICY "Enable insert access for authenticated users" ON "public"."organizations" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable insert access for authenticated users" ON "public"."user_organizations" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable insert for assessment creators" ON "public"."assessment_controls" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "assessments"."created_by"
   FROM "public"."assessments"
  WHERE ("assessments"."id" = "assessment_controls"."assessment_id"))));



CREATE POLICY "Enable insert for assessment creators and assigned users" ON "public"."evidence" FOR INSERT WITH CHECK ((("auth"."uid"() = "uploaded_by") AND (("auth"."uid"() = ( SELECT "a"."created_by"
   FROM ("public"."assessments" "a"
     JOIN "public"."assessment_controls" "ac" ON (("a"."id" = "ac"."assessment_id")))
  WHERE ("ac"."id" = "evidence"."assessment_control_id"))) OR ("auth"."uid"() = ( SELECT "assessment_controls"."assigned_to"
   FROM "public"."assessment_controls"
  WHERE ("assessment_controls"."id" = "evidence"."assessment_control_id"))))));



CREATE POLICY "Enable insert for authenticated users" ON "public"."assessments" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."controls" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."evidence" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."frameworks" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."assessment_controls" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."assessments" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."evidence" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."organizations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_organizations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."controls" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for authenticated users" ON "public"."evidence" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for authenticated users" ON "public"."frameworks" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable update access for organization admins" ON "public"."organizations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organizations"
  WHERE (("user_organizations"."organization_id" = "organizations"."id") AND ("user_organizations"."user_id" = "auth"."uid"()) AND ("user_organizations"."role" = 'admin'::"text")))));



CREATE POLICY "Enable update for assessment creators" ON "public"."assessments" FOR UPDATE USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Enable update for assigned users" ON "public"."assessment_controls" FOR UPDATE USING ((("auth"."uid"() = "assigned_to") OR ("auth"."uid"() = ( SELECT "assessments"."created_by"
   FROM "public"."assessments"
  WHERE ("assessments"."id" = "assessment_controls"."assessment_id"))))) WITH CHECK ((("auth"."uid"() = "assigned_to") OR ("auth"."uid"() = ( SELECT "assessments"."created_by"
   FROM "public"."assessments"
  WHERE ("assessments"."id" = "assessment_controls"."assessment_id")))));



CREATE POLICY "Enable update for control owners" ON "public"."controls" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for evidence creators" ON "public"."evidence" FOR UPDATE USING (("auth"."uid"() = "uploaded_by")) WITH CHECK (("auth"."uid"() = "uploaded_by"));



CREATE POLICY "Enable update for evidence owners" ON "public"."evidence" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for framework owners" ON "public"."frameworks" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for organization admins" ON "public"."user_organizations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organizations" "admins"
  WHERE (("admins"."organization_id" = "user_organizations"."organization_id") AND ("admins"."user_id" = "auth"."uid"()) AND ("admins"."role" = 'admin'::"text")))));



CREATE POLICY "Service role can manage all data" ON "public"."users" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can read their own data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."assessment_controls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_frameworks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."control_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."controls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."frameworks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limit" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rate_limit_modify_policy" ON "public"."rate_limit" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "rate_limit_select_policy" ON "public"."rate_limit" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."security_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION "supabase_realtime_messages_publication" OWNER TO "supabase_admin";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."increment_rate_limit"("key_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_rate_limit"("key_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_rate_limit"("key_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."assessment_controls" TO "anon";
GRANT ALL ON TABLE "public"."assessment_controls" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_controls" TO "service_role";



GRANT ALL ON TABLE "public"."assessments" TO "anon";
GRANT ALL ON TABLE "public"."assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."assessments" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_evidence" TO "anon";
GRANT ALL ON TABLE "public"."compliance_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_evidence" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_frameworks" TO "anon";
GRANT ALL ON TABLE "public"."compliance_frameworks" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_frameworks" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_reports" TO "anon";
GRANT ALL ON TABLE "public"."compliance_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_reports" TO "service_role";



GRANT ALL ON TABLE "public"."control_mappings" TO "anon";
GRANT ALL ON TABLE "public"."control_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."control_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."controls" TO "anon";
GRANT ALL ON TABLE "public"."controls" TO "authenticated";
GRANT ALL ON TABLE "public"."controls" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."evidence" TO "anon";
GRANT ALL ON TABLE "public"."evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."evidence" TO "service_role";



GRANT ALL ON TABLE "public"."frameworks" TO "anon";
GRANT ALL ON TABLE "public"."frameworks" TO "authenticated";
GRANT ALL ON TABLE "public"."frameworks" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."password_history" TO "anon";
GRANT ALL ON TABLE "public"."password_history" TO "authenticated";
GRANT ALL ON TABLE "public"."password_history" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limit" TO "anon";
GRANT ALL ON TABLE "public"."rate_limit" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limit" TO "service_role";



GRANT ALL ON TABLE "public"."security_alerts" TO "anon";
GRANT ALL ON TABLE "public"."security_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."security_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."subcontrols" TO "anon";
GRANT ALL ON TABLE "public"."subcontrols" TO "authenticated";
GRANT ALL ON TABLE "public"."subcontrols" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."user_mfa" TO "anon";
GRANT ALL ON TABLE "public"."user_mfa" TO "authenticated";
GRANT ALL ON TABLE "public"."user_mfa" TO "service_role";



GRANT ALL ON TABLE "public"."user_organizations" TO "anon";
GRANT ALL ON TABLE "public"."user_organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."user_organizations" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
