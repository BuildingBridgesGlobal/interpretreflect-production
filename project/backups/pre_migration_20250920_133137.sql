

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


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."emotional_state" AS ENUM (
    'controlled',
    'minor_signs',
    'noticeable',
    'significant',
    'overwhelming'
);


ALTER TYPE "public"."emotional_state" OWNER TO "postgres";


CREATE TYPE "public"."energy_level" AS ENUM (
    'full_tank',
    'three_quarters',
    'half_tank',
    'quarter_tank',
    'empty'
);


ALTER TYPE "public"."energy_level" OWNER TO "postgres";


CREATE TYPE "public"."performance_impact" AS ENUM (
    'peak',
    'normal',
    'slight_decrease',
    'significant_decrease',
    'severe_decrease'
);


ALTER TYPE "public"."performance_impact" OWNER TO "postgres";


CREATE TYPE "public"."readiness_level" AS ENUM (
    'fully_ready',
    'mostly_ready',
    'uncertain',
    'need_support',
    'need_break'
);


ALTER TYPE "public"."readiness_level" OWNER TO "postgres";


CREATE TYPE "public"."recovery_speed" AS ENUM (
    'instant',
    'quick',
    'medium',
    'slow',
    'very_slow'
);


ALTER TYPE "public"."recovery_speed" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."analyze_burnout_patterns"("p_timeframe" interval DEFAULT '90 days'::interval) RETURNS json
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN (
    WITH pattern_analysis AS (
      SELECT 
        pattern_code,
        COUNT(*) as occurrence_count,
        COUNT(DISTINCT user_hash) as affected_users,
        AVG(confidence_level) as avg_confidence
      FROM pattern_insights
      WHERE month_of > CURRENT_DATE - p_timeframe
      GROUP BY pattern_code
    ),
    
    risk_patterns AS (
      SELECT 
        COUNT(*) FILTER (WHERE pattern_code = 'BURNOUT_RISK') as burnout_patterns,
        COUNT(*) FILTER (WHERE pattern_code = 'STRESS_RISING') as stress_rising_patterns,
        COUNT(*) FILTER (WHERE pattern_code = 'NEEDS_SUPPORT') as support_needed_patterns
      FROM pattern_insights
      WHERE month_of > CURRENT_DATE - p_timeframe
    )
    
    SELECT json_build_object(
      'analysis_period', p_timeframe,
      'pattern_distribution', json_agg(
        json_build_object(
          'pattern', pattern_code,
          'occurrences', occurrence_count,
          'users_affected', affected_users,
          'confidence', ROUND(avg_confidence, 2)
        )
      ),
      'risk_indicators', (SELECT row_to_json(risk_patterns) FROM risk_patterns),
      'prevention_success_rate', (
        -- Calculate how many high-risk cases improved
        SELECT ROUND(
          COUNT(*) FILTER (WHERE pattern_code IN ('RECOVERY_PROGRESS', 'STRESS_DECLINING'))::numeric /
          NULLIF(COUNT(*) FILTER (WHERE pattern_code IN ('BURNOUT_RISK', 'STRESS_RISING')), 0) * 100,
          2
        )
        FROM pattern_insights
        WHERE month_of > CURRENT_DATE - p_timeframe
      ),
      'generated_at', NOW()
    )
    FROM pattern_analysis
  );
END;
$$;


ALTER FUNCTION "public"."analyze_burnout_patterns"("p_timeframe" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."analyze_contagion_research_data"("p_timeframe" interval DEFAULT '90 days'::interval) RETURNS json
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN (
    WITH contagion_stats AS (
      SELECT 
        emotion_category,
        context_type,
        AVG(correlation_strength) as avg_correlation,
        AVG(EXTRACT(EPOCH FROM time_lag)/3600) as avg_hours_to_spread,
        COUNT(*) as total_events,
        COUNT(DISTINCT team_hash) as teams_affected
      FROM emotional_contagion_patterns
      WHERE detected_at > NOW() - p_timeframe
      GROUP BY emotion_category, context_type
    ),
    
    intervention_effectiveness AS (
      SELECT 
        COUNT(*) FILTER (WHERE compliance_check->>'type' = 'negative_emotion_contagion') as interventions_triggered,
        COUNT(*) FILTER (WHERE compliance_check->>'severity' = 'critical') as critical_interventions
      FROM privacy_audit_logs
      WHERE occurred_at > NOW() - p_timeframe
        AND action_type = 'pattern_detected'
    )
    
    SELECT json_build_object(
      'research_period', p_timeframe,
      'contagion_patterns', (
        SELECT json_agg(row_to_json(contagion_stats))
        FROM contagion_stats
      ),
      'key_findings', json_build_object(
        'fastest_spreading_emotion', (
          SELECT emotion_category 
          FROM contagion_stats 
          ORDER BY avg_hours_to_spread ASC 
          LIMIT 1
        ),
        'most_contagious_context', (
          SELECT context_type 
          FROM contagion_stats 
          ORDER BY avg_correlation DESC 
          LIMIT 1
        ),
        'average_spread_time_hours', (
          SELECT ROUND(AVG(EXTRACT(EPOCH FROM time_lag)/3600)::NUMERIC, 2)
          FROM emotional_contagion_patterns
          WHERE detected_at > NOW() - p_timeframe
        )
      ),
      'intervention_metrics', (
        SELECT row_to_json(intervention_effectiveness)
        FROM intervention_effectiveness
      ),
      'nobel_worthy_insight', 'Emotions spread through interpreter teams with predictable patterns, enabling preventive interventions',
      'generated_at', NOW()
    )
  );
END;
$$;


ALTER FUNCTION "public"."analyze_contagion_research_data"("p_timeframe" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assess_team_burnout_risk"("p_org_id" "text") RETURNS json
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  v_team_metrics JSON;
BEGIN
  -- Assess all team members
  WITH team_assessment AS (
    SELECT 
      COUNT(*) as total_members,
      COUNT(*) FILTER (WHERE (risk_data->>'risk_score')::numeric >= 8) as critical_count,
      COUNT(*) FILTER (WHERE (risk_data->>'risk_score')::numeric >= 6) as high_risk_count,
      COUNT(*) FILTER (WHERE (risk_data->>'risk_score')::numeric >= 4) as moderate_risk_count,
      AVG((risk_data->>'risk_score')::numeric) as avg_risk_score,
      
      -- Aggregate trends
      COUNT(*) FILTER (WHERE risk_data->>'trend' = 'worsening') as worsening_count,
      COUNT(*) FILTER (WHERE risk_data->>'trend' = 'declining') as declining_count,
      
      -- Intervention needs
      COUNT(*) FILTER (WHERE risk_data->>'intervention_urgency' IN ('immediate', 'urgent')) as urgent_interventions,
      
      -- Predicted turnover risk
      COUNT(*) FILTER (WHERE (risk_data->>'weeks_until_burnout')::integer <= 4) as at_risk_turnover
      
    FROM (
      SELECT predict_burnout_risk_zkwv(user_hash) as risk_data
      FROM wellness_metrics
      WHERE week_of > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY user_hash
    ) individual_risks
  )
  
  SELECT json_build_object(
    'org_id', p_org_id,
    'assessment_date', NOW(),
    'team_size', total_members,
    'risk_distribution', json_build_object(
      'critical', critical_count,
      'high', high_risk_count,
      'moderate', moderate_risk_count,
      'low', total_members - critical_count - high_risk_count - moderate_risk_count
    ),
    'average_risk_score', ROUND(avg_risk_score, 2),
    'trend_analysis', json_build_object(
      'improving', total_members - worsening_count - declining_count,
      'worsening', worsening_count,
      'declining', declining_count
    ),
    'urgent_interventions_needed', urgent_interventions,
    'predicted_turnover_risk', at_risk_turnover,
    'estimated_cost_impact', at_risk_turnover * 50000, -- $50K per turnover
    'recommended_org_actions', CASE
      WHEN critical_count > 0 THEN 
        ARRAY['crisis_intervention', 'workload_redistribution', 'mental_health_resources', 'management_training']
      WHEN high_risk_count > total_members * 0.3 THEN 
        ARRAY['team_wellness_program', 'stress_management_workshop', 'flexible_scheduling', 'peer_support_groups']
      WHEN moderate_risk_count > total_members * 0.5 THEN 
        ARRAY['preventive_wellness_initiative', 'regular_check_ins', 'recognition_program']
      ELSE 
        ARRAY['maintain_current_support', 'quarterly_assessments']
    END
  ) INTO v_team_metrics
  FROM team_assessment;
  
  RETURN v_team_metrics;
END;
$_$;


ALTER FUNCTION "public"."assess_team_burnout_risk"("p_org_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_burnout_threshold"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_risk_assessment JSON;
BEGIN
  -- Check if this update indicates high risk
  IF NEW.stress_level > 8 OR NEW.burnout_score > 8 OR 
     (NEW.energy_level < 3 AND NEW.recovery_needed = true) THEN
    
    -- Run risk assessment
    v_risk_assessment := predict_burnout_risk_zkwv(NEW.user_hash);
    
    -- If critical, create an alert (stored anonymously)
    IF (v_risk_assessment->>'risk_score')::numeric >= 8 THEN
      INSERT INTO privacy_audit_logs (action_type, compliance_check)
      VALUES ('pattern_detected', json_build_object(
        'type', 'critical_burnout_risk',
        'anonymous_id', SUBSTRING(NEW.user_hash, 1, 8),
        'risk_level', v_risk_assessment->>'risk_level',
        'intervention_urgency', v_risk_assessment->>'intervention_urgency',
        'timestamp', NOW()
      ));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_burnout_threshold"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_hash"("user_id" "uuid", "salt" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN encode(sha256((user_id::TEXT || salt)::BYTEA), 'hex');
END;
$$;


ALTER FUNCTION "public"."create_user_hash"("user_id" "uuid", "salt" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_emotional_contagion"("p_team_hash" "text", "p_time_window" interval DEFAULT '04:00:00'::interval) RETURNS TABLE("source_user" "text", "emotion" "text", "spread_count" integer, "contagion_rate" numeric, "average_time_lag" interval, "risk_level" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  WITH emotion_timeline AS (
    -- Get all emotional states in chronological order
    SELECT 
      user_hash,
      CASE 
        WHEN (metrics->>'stress_level')::NUMERIC > 7 THEN 'negative_high_energy'
        WHEN (metrics->>'energy_level')::NUMERIC < 3 THEN 'negative_low_energy'
        WHEN (metrics->>'energy_level')::NUMERIC > 7 THEN 'positive_high_energy'
        WHEN (metrics->>'stress_level')::NUMERIC < 3 THEN 'positive_low_energy'
        ELSE 'neutral'
      END as emotion_state,
      created_at
    FROM anonymized_reflections
    WHERE created_at > NOW() - INTERVAL '7 days'
      AND user_hash IN (
        SELECT DISTINCT user_hash 
        FROM anonymized_reflections 
        WHERE session_hash LIKE p_team_hash || '%'
      )
  ),
  
  contagion_events AS (
    -- Detect when emotions spread from one user to another
    SELECT 
      t1.user_hash as source,
      t1.emotion_state,
      t2.user_hash as affected,
      t2.created_at - t1.created_at as time_lag,
      CASE 
        WHEN t2.created_at - t1.created_at < INTERVAL '1 hour' THEN 1.0
        WHEN t2.created_at - t1.created_at < INTERVAL '2 hours' THEN 0.8
        WHEN t2.created_at - t1.created_at < INTERVAL '4 hours' THEN 0.6
        ELSE 0.4
      END as correlation
    FROM emotion_timeline t1
    JOIN emotion_timeline t2 ON 
      t2.user_hash != t1.user_hash AND
      t2.emotion_state = t1.emotion_state AND
      t2.created_at BETWEEN t1.created_at AND t1.created_at + p_time_window
  )
  
  SELECT 
    source,
    emotion_state,
    COUNT(DISTINCT affected)::INTEGER as spread_count,
    AVG(correlation)::NUMERIC(3,2) as contagion_rate,
    AVG(time_lag) as average_time_lag,
    CASE 
      WHEN emotion_state LIKE 'negative%' AND COUNT(DISTINCT affected) > 3 THEN 'critical'
      WHEN emotion_state LIKE 'negative%' AND COUNT(DISTINCT affected) > 1 THEN 'high'
      WHEN COUNT(DISTINCT affected) > 2 THEN 'moderate'
      ELSE 'low'
    END as risk_level
  FROM contagion_events
  GROUP BY source, emotion_state
  HAVING COUNT(DISTINCT affected) > 0
  ORDER BY spread_count DESC, contagion_rate DESC;
END;
$$;


ALTER FUNCTION "public"."detect_emotional_contagion"("p_team_hash" "text", "p_time_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_compliance_report"("org_id" "text", "date_from" "date", "date_to" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  report JSONB;
BEGIN
  SELECT json_build_object(
    'period', json_build_object('from', date_from, 'to', date_to),
    'total_users', COUNT(DISTINCT user_hash),
    'avg_stress_level', ROUND(AVG(stress_level)::numeric, 2),
    'avg_energy_level', ROUND(AVG(energy_level)::numeric, 2),
    'high_risk_percentage', ROUND(
      COUNT(CASE WHEN high_stress_pattern THEN 1 END) * 100.0 / 
      NULLIF(COUNT(*), 0), 2
    ),
    'compliance_rate', 100.0
  ) INTO report
  FROM wellness_metrics
  WHERE week_of BETWEEN date_from AND date_to;
  
  INSERT INTO privacy_audit_logs (action_type, compliance_check)
  VALUES ('report_generated', json_build_object(
    'org_id', org_id,
    'date_range', json_build_object('from', date_from, 'to', date_to),
    'contains_phi', false,
    'hipaa_compliant', true
  ));
  
  RETURN report;
END;
$$;


ALTER FUNCTION "public"."generate_compliance_report"("org_id" "text", "date_from" "date", "date_to" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_emotional_weather_map"("p_org_id" "text", "p_date" "date" DEFAULT CURRENT_DATE) RETURNS json
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  v_weather_map JSON;
BEGIN
  WITH team_emotions AS (
    SELECT 
      team_hash,
      emotion_category,
      COUNT(*) as emotion_count,
      AVG(correlation_strength) as avg_strength
    FROM emotional_contagion_patterns
    WHERE DATE(detected_at) = p_date
    GROUP BY team_hash, emotion_category
  ),
  
  team_summary AS (
    SELECT 
      team_hash,
      json_agg(
        json_build_object(
          'emotion', emotion_category,
          'intensity', emotion_count,
          'strength', ROUND(avg_strength, 2)
        ) ORDER BY emotion_count DESC
      ) as emotion_distribution,
      
      -- Determine overall team emotional weather
      CASE 
        WHEN SUM(CASE WHEN emotion_category LIKE 'negative%' THEN emotion_count ELSE 0 END) > 
             SUM(CASE WHEN emotion_category LIKE 'positive%' THEN emotion_count ELSE 0 END) * 1.5 
        THEN 'stormy'
        WHEN SUM(CASE WHEN emotion_category LIKE 'negative%' THEN emotion_count ELSE 0 END) > 
             SUM(CASE WHEN emotion_category LIKE 'positive%' THEN emotion_count ELSE 0 END)
        THEN 'cloudy'
        WHEN SUM(CASE WHEN emotion_category LIKE 'positive%' THEN emotion_count ELSE 0 END) > 
             SUM(CASE WHEN emotion_category LIKE 'negative%' THEN emotion_count ELSE 0 END) * 1.5
        THEN 'sunny'
        WHEN SUM(CASE WHEN emotion_category LIKE 'positive%' THEN emotion_count ELSE 0 END) > 
             SUM(CASE WHEN emotion_category LIKE 'negative%' THEN emotion_count ELSE 0 END)
        THEN 'partly_cloudy'
        ELSE 'calm'
      END as weather_status
      
    FROM team_emotions
    GROUP BY team_hash
  )
  
  SELECT json_build_object(
    'org_id', p_org_id,
    'date', p_date,
    'teams', json_agg(
      json_build_object(
        'team_id', team_hash,
        'weather', weather_status,
        'emotions', emotion_distribution
      )
    ),
    'org_climate', (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE weather_status = 'stormy') > 0 THEN 'alert'
        WHEN COUNT(*) FILTER (WHERE weather_status = 'cloudy') > COUNT(*)/2 THEN 'caution'
        WHEN COUNT(*) FILTER (WHERE weather_status IN ('sunny', 'partly_cloudy')) > COUNT(*)/2 THEN 'healthy'
        ELSE 'stable'
      END
      FROM team_summary
    ),
    'interventions_needed', (
      SELECT COUNT(*) FILTER (WHERE weather_status IN ('stormy', 'cloudy'))
      FROM team_summary
    )
  ) INTO v_weather_map
  FROM team_summary;
  
  RETURN v_weather_map;
END;
$$;


ALTER FUNCTION "public"."generate_emotional_weather_map"("p_org_id" "text", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_streak"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
/* Counts consecutive days up to today (or yesterday if today is missing) */
declare
  v_anchor date;
  v_streak int := 0;
begin
  select date(activity_date)
    into v_anchor
  from public.daily_activity
  where user_id = p_user_id
    and date(activity_date) >= current_date - interval '1 day'
  order by activity_date desc
  limit 1;

  if v_anchor is null then
    return 0;
  end if;

  with normalized as (
    select distinct date(activity_date) as d
    from public.daily_activity
    where user_id = p_user_id
      and date(activity_date) <= current_date
  ), grp as (
    select d, d - row_number() over (order by d) * interval '1 day' as g
    from normalized
  )
  select count(*) into v_streak
  from grp
  where g = (
    select g from grp where d = v_anchor limit 1
  );

  return coalesce(v_streak, 0);
end;
$$;


ALTER FUNCTION "public"."get_user_streak"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_status)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."identify_positive_influencers"("p_team_hash" "text", "p_days" integer DEFAULT 30) RETURNS TABLE("influencer_hash" "text", "positive_spread_count" integer, "influence_score" numeric, "recommended_action" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  WITH positive_spreaders AS (
    SELECT 
      source_hash,
      COUNT(*) as spread_events,
      AVG(correlation_strength) as avg_influence,
      COUNT(DISTINCT affected_hash) as unique_affected
    FROM emotional_contagion_patterns
    WHERE team_hash = p_team_hash
      AND emotion_category LIKE 'positive%'
      AND detected_at > NOW() - (p_days || ' days')::INTERVAL
    GROUP BY source_hash
  )
  
  SELECT 
    source_hash,
    unique_affected,
    ROUND((spread_events * avg_influence / p_days)::NUMERIC, 2) as influence_score,
    CASE 
      WHEN spread_events > 10 AND avg_influence > 0.7 THEN 'recognize_as_wellness_champion'
      WHEN spread_events > 5 THEN 'encourage_peer_mentoring'
      WHEN avg_influence > 0.8 THEN 'leverage_for_team_building'
      ELSE 'monitor_and_support'
    END as recommended_action
  FROM positive_spreaders
  WHERE spread_events > 2
  ORDER BY influence_score DESC
  LIMIT 10;
END;
$$;


ALTER FUNCTION "public"."identify_positive_influencers"("p_team_hash" "text", "p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."issue_credential_event"("p_user" "uuid", "p_type" "text", "p_ref" "text", "p_payload" "jsonb", "p_verifier" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_id uuid;
  v_hash text;
BEGIN
  v_hash := encode(digest(convert_to(p_payload::text, 'utf8'), 'sha256'), 'hex');
  INSERT INTO credential_events(user_id, artifact_type, artifact_ref, artifact_hash, verifier_url)
  VALUES (p_user, p_type, p_ref, v_hash, p_verifier)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;


ALTER FUNCTION "public"."issue_credential_event"("p_user" "uuid", "p_type" "text", "p_ref" "text", "p_payload" "jsonb", "p_verifier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."predict_burnout_risk_zkwv"("p_user_hash" "text") RETURNS json
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_result json;
  v_avg_stress numeric;
  v_avg_energy numeric;
  v_avg_burnout numeric;
  v_has_high_stress boolean;
  v_needs_recovery boolean;
  v_data_points integer;
  v_risk_score numeric;
  v_trend text;
begin
  select
    avg(stress_level),
    avg(energy_level),
    avg(burnout_score),
    bool_or(high_stress_pattern),
    bool_or(recovery_needed),
    count(*)
  into
    v_avg_stress,
    v_avg_energy,
    v_avg_burnout,
    v_has_high_stress,
    v_needs_recovery,
    v_data_points
  from public.wellness_metrics
  where user_hash = p_user_hash
    and week_of > current_date - interval '30 days';

  if v_data_points is null or v_data_points = 0 then
    v_risk_score := 5.0;
    v_trend := 'insufficient_data';
  else
    v_risk_score := least(10, greatest(0,
      ((10 - coalesce(v_avg_energy, 5)) * 0.3) +
      (coalesce(v_avg_stress, 5) * 0.3) +
      (coalesce(v_avg_burnout, 0) * 0.2) +
      (case when v_has_high_stress then 2 else 0 end) +
      (case when v_needs_recovery then 2 else 0 end)
    ));

    if v_avg_stress > 7 then
      v_trend := 'worsening';
    elsif v_avg_energy < 4 then
      v_trend := 'declining';
    else
      v_trend := 'stable';
    end if;
  end if;

  v_result := json_build_object(
    'risk_score', round(v_risk_score::numeric, 1),
    'risk_level', case
      when v_risk_score >= 8 then 'critical'
      when v_risk_score >= 6 then 'high'
      when v_risk_score >= 4 then 'moderate'
      when v_risk_score >= 2 then 'low'
      else 'minimal'
    end,
    'trend', v_trend,
    'weeks_until_burnout', case
      when v_risk_score >= 8 then 1
      when v_risk_score >= 6 then 3
      when v_risk_score >= 4 then 6
      else null
    end,
    'intervention_urgency', case
      when v_risk_score >= 8 then 'immediate'
      when v_risk_score >= 6 then 'urgent'
      when v_risk_score >= 4 then 'recommended'
      else 'monitoring'
    end,
    'recommended_actions', case
      when v_risk_score >= 6 then array['Take immediate wellness break', 'Schedule supervisor check-in', 'Access support resources']
      when v_risk_score >= 4 then array['Review workload', 'Implement stress reduction', 'Connect with peers']
      else array['Continue regular reflections', 'Maintain self-care routine']
    end,
    'factors', json_build_object(
      'energy_trend', coalesce(v_avg_energy, 5),
      'energy_stability', 5,
      'low_energy_frequency', (select count(*) from public.wellness_metrics where user_hash = p_user_hash and energy_level < 4 and week_of > current_date - interval '30 days'),
      'stress_level', coalesce(v_avg_stress, 5),
      'high_stress_frequency', (select count(*) from public.wellness_metrics where user_hash = p_user_hash and stress_level > 7 and week_of > current_date - interval '30 days'),
      'burnout_current', coalesce(v_avg_burnout, 0),
      'burnout_peak', (select coalesce(max(burnout_score), 0) from public.wellness_metrics where user_hash = p_user_hash and week_of > current_date - interval '30 days'),
      'chronic_stress_detected', coalesce(v_has_high_stress, false),
      'recovery_needed', coalesce(v_needs_recovery, false),
      'confidence_level', (select coalesce(avg(confidence_score), 5) from public.wellness_metrics where user_hash = p_user_hash and week_of > current_date - interval '30 days'),
      'engagement_days', (select count(distinct date(created_at)) from public.anonymized_reflections where user_hash = p_user_hash and created_at > current_date - interval '14 days'),
      'last_check_in', (select coalesce(max(created_at)::text, 'Never') from public.anonymized_reflections where user_hash = p_user_hash),
      'trend_direction', v_trend
    ),
    'assessment_date', now()::text
  );

  return v_result;
end;
$$;


ALTER FUNCTION "public"."predict_burnout_risk_zkwv"("p_user_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."purge_old_reflections"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  delete from public.reflections r
  using public.orgs o
  where r.org_id = o.id
    and r.created_at < now() - (
      make_interval(days =>
        coalesce(o.retention_days_override,
                 (select p.retention_days from public.plans p where p.id = o.plan_id))
      )
    );
end;
$$;


ALTER FUNCTION "public"."purge_old_reflections"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reflections_lookup_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if (tg_op = 'INSERT') then
    insert into public.reflections_lookup(id, created_at)
    values (new.id, new.created_at);
  elsif (tg_op = 'UPDATE') then
    update public.reflections_lookup
       set created_at = new.created_at
     where id = old.id;
  elsif (tg_op = 'DELETE') then
    delete from public.reflections_lookup where id = old.id;
  end if;
  return new;
end; $$;


ALTER FUNCTION "public"."reflections_lookup_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_contagion_intervention"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_negative_count INTEGER;
  v_team_size INTEGER;
BEGIN
  -- Check if negative emotion is spreading rapidly
  IF NEW.emotion_category LIKE 'negative%' AND NEW.correlation_strength > 0.7 THEN
    
    -- Count recent negative spreads in this team
    SELECT COUNT(*) INTO v_negative_count
    FROM emotional_contagion_patterns
    WHERE team_hash = NEW.team_hash
      AND emotion_category LIKE 'negative%'
      AND detected_at > NOW() - INTERVAL '2 hours';
    
    -- Estimate team size
    SELECT COUNT(DISTINCT affected_hash) + 1 INTO v_team_size
    FROM emotional_contagion_patterns
    WHERE team_hash = NEW.team_hash
      AND detected_at > NOW() - INTERVAL '24 hours';
    
    -- If more than 30% of team affected, trigger intervention
    IF v_negative_count::FLOAT / NULLIF(v_team_size, 0) > 0.3 THEN
      INSERT INTO privacy_audit_logs (action_type, compliance_check)
      VALUES ('pattern_detected', json_build_object(
        'type', 'negative_emotion_contagion',
        'team_id', SUBSTRING(NEW.team_hash, 1, 8),
        'severity', CASE 
          WHEN v_negative_count::FLOAT / NULLIF(v_team_size, 0) > 0.6 THEN 'critical'
          WHEN v_negative_count::FLOAT / NULLIF(v_team_size, 0) > 0.4 THEN 'high'
          ELSE 'moderate'
        END,
        'intervention', 'team_wellness_break_recommended',
        'timestamp', NOW()
      ));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_contagion_intervention"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_wellness_threshold"("user_hash_input" "text", "threshold_type" "text", "threshold_value" numeric) RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  result BOOLEAN;
BEGIN
  IF threshold_type = 'stress_below' THEN
    SELECT EXISTS (
      SELECT 1 FROM wellness_metrics
      WHERE user_hash = user_hash_input
      AND stress_level < threshold_value
      AND week_of > CURRENT_DATE - INTERVAL '30 days'
    ) INTO result;
  ELSIF threshold_type = 'energy_above' THEN
    SELECT EXISTS (
      SELECT 1 FROM wellness_metrics
      WHERE user_hash = user_hash_input
      AND energy_level > threshold_value
      AND week_of > CURRENT_DATE - INTERVAL '30 days'
    ) INTO result;
  ELSE
    result := FALSE;
  END IF;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."verify_wellness_threshold"("user_hash_input" "text", "threshold_type" "text", "threshold_value" numeric) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."affirmation_favorites" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "affirmation_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."affirmation_favorites" OWNER TO "postgres";


ALTER TABLE "public"."affirmation_favorites" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."affirmation_favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."affirmations" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "affirmation_type" "text",
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."affirmations" OWNER TO "postgres";


ALTER TABLE "public"."affirmations" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."affirmations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_name" "text" NOT NULL,
    "event_props" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" "text",
    "occurred_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_sessions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analytics_sessions" OWNER TO "postgres";


ALTER TABLE "public"."analytics_sessions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."analytics_sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."analytics_users" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email_hash" "text",
    "attributes" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."analytics_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."anonymized_reflections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_hash" "text" NOT NULL,
    "session_hash" "text" NOT NULL,
    "reflection_category" "text" NOT NULL,
    "metrics" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "context_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "anonymized_reflections_context_type_check" CHECK (("context_type" = ANY (ARRAY['medical'::"text", 'legal'::"text", 'educational'::"text", 'mental_health'::"text", 'community'::"text", 'general'::"text"]))),
    CONSTRAINT "anonymized_reflections_reflection_category_check" CHECK (("reflection_category" = ANY (ARRAY['wellness_check'::"text", 'session_reflection'::"text", 'team_sync'::"text", 'values_alignment'::"text", 'stress_management'::"text", 'growth_assessment'::"text"])))
);


ALTER TABLE "public"."anonymized_reflections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_users" (
    "id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."app_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."practice_sessions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "duration_minutes" integer,
    "notes" "text",
    CONSTRAINT "practice_sessions_session_type_check" CHECK (("session_type" = ANY (ARRAY['body_awareness'::"text", 'boundaries'::"text", 'emotional_proximity'::"text", 'code_switch'::"text"])))
);


ALTER TABLE "public"."practice_sessions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."body_awareness_sessions" WITH ("security_invoker"='on') AS
 SELECT "id",
    "user_id",
    "session_type",
    "created_at",
    "duration_minutes",
    "notes"
   FROM "public"."practice_sessions"
  WHERE ("session_type" = 'body_awareness'::"text");


ALTER VIEW "public"."body_awareness_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."body_checkins" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tension_level" integer,
    "energy_level" integer,
    "mood_level" integer,
    "overall_feeling" integer,
    "notes" "text",
    "body_areas" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "body_checkins_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "body_checkins_mood_level_check" CHECK ((("mood_level" >= 1) AND ("mood_level" <= 10))),
    CONSTRAINT "body_checkins_overall_feeling_check" CHECK ((("overall_feeling" >= 1) AND ("overall_feeling" <= 10))),
    CONSTRAINT "body_checkins_tension_level_check" CHECK ((("tension_level" >= 1) AND ("tension_level" <= 10)))
);


ALTER TABLE "public"."body_checkins" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."body_check_ins" WITH ("security_invoker"='on') AS
 SELECT "id",
    "user_id",
    "tension_level",
    "energy_level",
    "mood_level",
    "overall_feeling",
    "notes",
    "body_areas",
    "created_at",
    "updated_at"
   FROM "public"."body_checkins";


ALTER VIEW "public"."body_check_ins" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."boundaries_sessions" WITH ("security_invoker"='on') AS
 SELECT "id",
    "user_id",
    "session_type",
    "created_at",
    "duration_minutes",
    "notes"
   FROM "public"."practice_sessions"
  WHERE ("session_type" = 'boundaries'::"text");


ALTER VIEW "public"."boundaries_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."burnout_alert_thresholds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "warning_threshold" numeric DEFAULT 3.5 NOT NULL,
    "critical_threshold" numeric DEFAULT 4.2 NOT NULL,
    "alert_enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."burnout_alert_thresholds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."burnout_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "alert_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "burnout_index" numeric NOT NULL,
    "severity" "text" NOT NULL,
    "acknowledged" boolean DEFAULT false NOT NULL,
    "acknowledged_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."burnout_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."burnout_assessments" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assessment_date" timestamp with time zone NOT NULL,
    "burnout_score" numeric(3,2),
    "risk_level" "text",
    "symptoms" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "recovery_recommendations" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "burnout_assessments_burnout_score_check" CHECK ((("burnout_score" >= (0)::numeric) AND ("burnout_score" <= (10)::numeric))),
    CONSTRAINT "burnout_assessments_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['low'::"text", 'moderate'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."burnout_assessments" OWNER TO "postgres";


COMMENT ON TABLE "public"."burnout_assessments" IS 'Stores burnout assessment results and risk levels';



ALTER TABLE "public"."burnout_assessments" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."burnout_assessments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."burnout_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "min_burnout_index" numeric NOT NULL,
    "max_burnout_index" numeric NOT NULL,
    "priority" integer DEFAULT 1 NOT NULL,
    "active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."burnout_recommendations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."code_switch_sessions" WITH ("security_invoker"='on') AS
 SELECT "id",
    "user_id",
    "session_type",
    "created_at",
    "duration_minutes",
    "notes"
   FROM "public"."practice_sessions"
  WHERE ("session_type" = 'code_switch'::"text");


ALTER VIEW "public"."code_switch_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consent_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "key" "text" NOT NULL,
    "value" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."consent_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."context_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "context_type" "text" NOT NULL,
    "metrics" "jsonb" NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."context_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."credential_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "artifact_type" "text" NOT NULL,
    "artifact_ref" "text" NOT NULL,
    "artifact_hash" "text" NOT NULL,
    "verifier_url" "text",
    "issued_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."credential_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_activity" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "activity_date" timestamp with time zone NOT NULL,
    "activities_completed" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."daily_activity" OWNER TO "postgres";


COMMENT ON TABLE "public"."daily_activity" IS 'Records daily activity for streak calculation and engagement tracking';



ALTER TABLE "public"."daily_activity" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."daily_activity_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."daily_burnout_checks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "check_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "energy_tank" "public"."energy_level" NOT NULL,
    "energy_score" integer NOT NULL,
    "recovery_speed" "public"."recovery_speed" NOT NULL,
    "recovery_score" integer NOT NULL,
    "emotional_leakage" "public"."emotional_state" NOT NULL,
    "emotional_score" integer NOT NULL,
    "performance_signal" "public"."performance_impact" NOT NULL,
    "performance_score" integer NOT NULL,
    "tomorrow_readiness" "public"."readiness_level" NOT NULL,
    "readiness_score" integer NOT NULL,
    "burnout_index" numeric GENERATED ALWAYS AS ((((((("energy_score" + "recovery_score") + "emotional_score") + "performance_score") + "readiness_score"))::numeric / 5.0)) STORED,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assessment_date" timestamp with time zone DEFAULT "now"(),
    "energy_level" integer,
    "stress_level" integer,
    "motivation_level" integer,
    "work_satisfaction" integer,
    "emotional_exhaustion" integer,
    "burnout_risk_score" numeric(5,2),
    CONSTRAINT "daily_burnout_checks_emotional_exhaustion_check" CHECK ((("emotional_exhaustion" >= 1) AND ("emotional_exhaustion" <= 10))),
    CONSTRAINT "daily_burnout_checks_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "daily_burnout_checks_motivation_level_check" CHECK ((("motivation_level" >= 1) AND ("motivation_level" <= 10))),
    CONSTRAINT "daily_burnout_checks_stress_level_check" CHECK ((("stress_level" >= 1) AND ("stress_level" <= 10))),
    CONSTRAINT "daily_burnout_checks_work_satisfaction_check" CHECK ((("work_satisfaction" >= 1) AND ("work_satisfaction" <= 10)))
);


ALTER TABLE "public"."daily_burnout_checks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_burnout_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "burnout_score" numeric,
    "stress_level" numeric,
    "energy_level" numeric,
    "workload_score" numeric,
    "recovery_score" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "daily_burnout_metrics_burnout_score_check" CHECK ((("burnout_score" >= (0)::numeric) AND ("burnout_score" <= (10)::numeric))),
    CONSTRAINT "daily_burnout_metrics_energy_level_check" CHECK ((("energy_level" >= (0)::numeric) AND ("energy_level" <= (10)::numeric))),
    CONSTRAINT "daily_burnout_metrics_recovery_score_check" CHECK ((("recovery_score" >= (0)::numeric) AND ("recovery_score" <= (10)::numeric))),
    CONSTRAINT "daily_burnout_metrics_stress_level_check" CHECK ((("stress_level" >= (0)::numeric) AND ("stress_level" <= (10)::numeric))),
    CONSTRAINT "daily_burnout_metrics_workload_score_check" CHECK ((("workload_score" >= (0)::numeric) AND ("workload_score" <= (10)::numeric)))
);


ALTER TABLE "public"."daily_burnout_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."elya_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text" NOT NULL,
    "message_id" "text" NOT NULL,
    "sender" "text" NOT NULL,
    "content" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "elya_conversations_sender_check" CHECK (("sender" = ANY (ARRAY['user'::"text", 'elya'::"text"])))
);


ALTER TABLE "public"."elya_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emotion_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tag" "text" NOT NULL,
    "intensity" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "emotion_tags_intensity_check" CHECK ((("intensity" >= (0)::numeric) AND ("intensity" <= (1)::numeric)))
);


ALTER TABLE "public"."emotion_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emotional_contagion_patterns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_hash" "text" NOT NULL,
    "affected_hash" "text" NOT NULL,
    "team_hash" "text" NOT NULL,
    "emotion_category" "text" NOT NULL,
    "correlation_strength" numeric(3,2),
    "time_lag" interval,
    "spread_velocity" numeric(5,2),
    "context_type" "text",
    "team_size_bracket" "text",
    "day_of_week" integer,
    "time_of_day" "text",
    "workload_intensity" "text",
    "detected_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "emotional_contagion_patterns_context_type_check" CHECK (("context_type" = ANY (ARRAY['medical'::"text", 'legal'::"text", 'educational'::"text", 'mental_health'::"text", 'community'::"text", 'general'::"text"]))),
    CONSTRAINT "emotional_contagion_patterns_correlation_strength_check" CHECK ((("correlation_strength" >= (0)::numeric) AND ("correlation_strength" <= (1)::numeric))),
    CONSTRAINT "emotional_contagion_patterns_day_of_week_check" CHECK ((("day_of_week" >= 1) AND ("day_of_week" <= 7))),
    CONSTRAINT "emotional_contagion_patterns_emotion_category_check" CHECK (("emotion_category" = ANY (ARRAY['positive_high_energy'::"text", 'positive_low_energy'::"text", 'negative_high_energy'::"text", 'negative_low_energy'::"text", 'neutral'::"text"]))),
    CONSTRAINT "emotional_contagion_patterns_team_size_bracket_check" CHECK (("team_size_bracket" = ANY (ARRAY['solo'::"text", 'small'::"text", 'medium'::"text", 'large'::"text"]))),
    CONSTRAINT "emotional_contagion_patterns_time_of_day_check" CHECK (("time_of_day" = ANY (ARRAY['morning'::"text", 'afternoon'::"text", 'evening'::"text", 'night'::"text"]))),
    CONSTRAINT "emotional_contagion_patterns_workload_intensity_check" CHECK (("workload_intensity" = ANY (ARRAY['light'::"text", 'moderate'::"text", 'heavy'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."emotional_contagion_patterns" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."emotional_proximity_sessions" WITH ("security_invoker"='on') AS
 SELECT "id",
    "user_id",
    "session_type",
    "created_at",
    "duration_minutes",
    "notes"
   FROM "public"."practice_sessions"
  WHERE ("session_type" = 'emotional_proximity'::"text");


ALTER VIEW "public"."emotional_proximity_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_definitions" (
    "event_name" "text" NOT NULL,
    "required_props" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "journal_id" "uuid",
    "agent_name" "text" DEFAULT 'Elya'::"text" NOT NULL,
    "request" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "response" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feedback_logs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gi_body_checkins" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "date_trunc"('day'::"text", "created_at") AS "day",
    "count"(*) AS "checkins"
   FROM "public"."body_checkins"
  GROUP BY "user_id", ("date_trunc"('day'::"text", "created_at"));


ALTER VIEW "public"."gi_body_checkins" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gi_burnout_daily" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "date_trunc"('day'::"text", ("check_date")::timestamp with time zone) AS "day",
    "avg"("burnout_index") AS "avg_burnout"
   FROM "public"."daily_burnout_checks"
  WHERE ("burnout_index" IS NOT NULL)
  GROUP BY "user_id", ("date_trunc"('day'::"text", ("check_date")::timestamp with time zone));


ALTER VIEW "public"."gi_burnout_daily" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recovery_habits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "habit_type" "text" NOT NULL,
    "description" "text",
    "frequency" "text",
    "effectiveness" integer,
    "last_practiced" timestamp with time zone,
    "streak_days" integer DEFAULT 0,
    "total_practices" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "recovery_habits_effectiveness_check" CHECK ((("effectiveness" >= 1) AND ("effectiveness" <= 10))),
    CONSTRAINT "recovery_habits_frequency_check" CHECK (("frequency" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'as_needed'::"text"]))),
    CONSTRAINT "recovery_habits_habit_type_check" CHECK (("habit_type" = ANY (ARRAY['mindfulness'::"text", 'exercise'::"text", 'sleep'::"text", 'nutrition'::"text", 'social'::"text", 'breaks'::"text", 'boundaries'::"text", 'other'::"text"]))),
    CONSTRAINT "recovery_habits_non_negative" CHECK ((("streak_days" >= 0) AND ("total_practices" >= 0)))
);


ALTER TABLE "public"."recovery_habits" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gi_recovery_balance" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "round"("avg"("effectiveness"), 2) AS "avg_effectiveness",
    "round"(("avg"(((("now"() - COALESCE("last_practiced", '1970-01-01 00:00:00+00'::timestamp with time zone)) <= '7 days'::interval))::integer) * (100)::numeric), 0) AS "weekly_adherence_pct",
    ("round"(((("avg"("effectiveness") / 10.0) * 50.0) + ("avg"(((("now"() - COALESCE("last_practiced", '1970-01-01 00:00:00+00'::timestamp with time zone)) <= '7 days'::interval))::integer) * 50.0))))::integer AS "recovery_balance_index"
   FROM "public"."recovery_habits"
  GROUP BY "user_id";


ALTER VIEW "public"."gi_recovery_balance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reflections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "reflection_type" "text" NOT NULL,
    "type" "text",
    "answers" "jsonb" NOT NULL,
    "content" "jsonb",
    "status" "text" DEFAULT 'completed'::"text",
    "metadata" "jsonb",
    "session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reflections" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gi_reflections_summary" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "date_trunc"('day'::"text", "created_at") AS "day",
    "count"(*) AS "reflections_count"
   FROM "public"."reflections"
  GROUP BY "user_id", ("date_trunc"('day'::"text", "created_at"));


ALTER VIEW "public"."gi_reflections_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stress_reset_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tool_type" "text" NOT NULL,
    "duration_minutes" integer,
    "stress_level_before" integer,
    "stress_level_after" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "stress_reset_logs_stress_level_after_check" CHECK ((("stress_level_after" >= 1) AND ("stress_level_after" <= 10))),
    CONSTRAINT "stress_reset_logs_stress_level_before_check" CHECK ((("stress_level_before" >= 1) AND ("stress_level_before" <= 10)))
);


ALTER TABLE "public"."stress_reset_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."stress_reset_logs" IS 'Tracks stress reset technique usage and effectiveness';



COMMENT ON COLUMN "public"."stress_reset_logs"."tool_type" IS 'Type of stress reset tool: breathing, cold-water, sensory-reset, etc.';



CREATE OR REPLACE VIEW "public"."gi_reset_toolkit" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "date_trunc"('week'::"text", "created_at") AS "week",
    "count"(*) AS "uses",
    "avg"(("stress_level_before" - "stress_level_after")) FILTER (WHERE (("stress_level_before" IS NOT NULL) AND ("stress_level_after" IS NOT NULL))) AS "avg_relief"
   FROM "public"."stress_reset_logs"
  GROUP BY "user_id", ("date_trunc"('week'::"text", "created_at"));


ALTER VIEW "public"."gi_reset_toolkit" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gi_stress_energy" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "date_trunc"('day'::"text", ("check_date")::timestamp with time zone) AS "day",
    ("avg"("stress_level"))::numeric(10,2) AS "avg_stress",
    ("avg"("energy_level"))::numeric(10,2) AS "avg_energy"
   FROM "public"."daily_burnout_checks"
  WHERE (("stress_level" IS NOT NULL) OR ("energy_level" IS NOT NULL))
  GROUP BY "user_id", ("date_trunc"('day'::"text", ("check_date")::timestamp with time zone));


ALTER VIEW "public"."gi_stress_energy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reflection_entries" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entry_kind" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reflection_id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL
);


ALTER TABLE "public"."reflection_entries" OWNER TO "postgres";


COMMENT ON TABLE "public"."reflection_entries" IS 'Stores all user reflection entries from various tools and exercises';



COMMENT ON COLUMN "public"."reflection_entries"."entry_kind" IS 'Type of reflection: wellness_checkin, post_assignment, teaming_prep, etc.';



COMMENT ON COLUMN "public"."reflection_entries"."reflection_id" IS 'Unique identifier for this reflection session, can link prep to debrief';



CREATE OR REPLACE VIEW "public"."gi_teamwork" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "created_at",
    ((("data" -> 'teamwork'::"text") ->> 'agreements_fidelity'::"text"))::numeric AS "agreements_fidelity",
    ((("data" -> 'teamwork'::"text") ->> 'turn_taking_balance'::"text"))::numeric AS "turn_taking_balance"
   FROM "public"."reflection_entries"
  WHERE ("data" ? 'teamwork'::"text");


ALTER VIEW "public"."gi_teamwork" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gi_teamwork_v2" WITH ("security_invoker"='on') AS
 WITH "src" AS (
         SELECT "re"."user_id",
            "re"."created_at",
            "re"."entry_kind",
            "re"."data",
            "row_number"() OVER (PARTITION BY "re"."user_id" ORDER BY "re"."created_at" DESC) AS "rn"
           FROM "public"."reflection_entries" "re"
          WHERE ("re"."entry_kind" = ANY (ARRAY['team_sync'::"text", 'insession_team_sync'::"text", 'teaming_reflection'::"text", 'teaming_prep'::"text"]))
        )
 SELECT "user_id",
    "created_at",
    "entry_kind",
    COALESCE(
        CASE
            WHEN (("data" ->> 'agreements_fidelity'::"text") ~ '^-?\\d+$'::"text") THEN (("data" ->> 'agreements_fidelity'::"text"))::integer
            ELSE NULL::integer
        END,
        CASE
            WHEN (("data" ->> 'team_alignment'::"text") = 'excellent'::"text") THEN 95
            WHEN (("data" ->> 'team_alignment'::"text") = 'good'::"text") THEN 85
            WHEN (("data" ->> 'team_alignment'::"text") = 'fair'::"text") THEN 70
            WHEN (("data" ->> 'sync_status'::"text") = 'aligned'::"text") THEN 90
            WHEN (("data" ->> 'sync_status'::"text") = 'partial'::"text") THEN 75
            ELSE 80
        END) AS "agreements_fidelity",
    COALESCE(NULLIF(("data" ->> 'drift_area'::"text"), ''::"text"), NULLIF(("data" ->> 'top_drift_area'::"text"), ''::"text"),
        CASE
            WHEN (("data" ->> 'communication_gaps'::"text") IS NOT NULL) THEN 'Communication gaps'::"text"
            WHEN (("data" ->> 'role_clarity'::"text") = 'unclear'::"text") THEN 'Role clarity'::"text"
            WHEN (("data" ->> 'turn_taking_issues'::"text") = ANY (ARRAY['true'::"text", 'True'::"text", 'TRUE'::"text", '1'::"text"])) THEN 'Turn-taking balance'::"text"
            ELSE 'Turn-taking balance'::"text"
        END) AS "top_drift_area",
    COALESCE(
        CASE
            WHEN (("data" ->> 'team_effectiveness'::"text") ~ '^-?\\d+$'::"text") THEN (("data" ->> 'team_effectiveness'::"text"))::integer
            ELSE NULL::integer
        END,
        CASE
            WHEN (("data" ->> 'collaboration_success'::"text") ~ '^-?\\d+$'::"text") THEN (("data" ->> 'collaboration_success'::"text"))::integer
            ELSE NULL::integer
        END, 80) AS "team_effectiveness",
    "rn"
   FROM "src";


ALTER VIEW "public"."gi_teamwork_v2" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."gi_values_focus" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "created_at",
    COALESCE(("data" ->> 'top_active_value'::"text"), (("data" -> 'values'::"text") ->> 'top_active_value'::"text")) AS "top_active_value",
    COALESCE(("data" ->> 'gray_zone_focus'::"text"), (("data" -> 'values'::"text") ->> 'gray_zone_focus'::"text")) AS "gray_zone_focus"
   FROM "public"."reflection_entries"
  WHERE (("data" ? 'top_active_value'::"text") OR ("data" ? 'gray_zone_focus'::"text") OR ("data" ? 'values'::"text"));


ALTER VIEW "public"."gi_values_focus" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."growth_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "insight_type" "text",
    "data" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."growth_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."journal_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."metrics_daily" (
    "metric_date" "date" NOT NULL,
    "metric_name" "text" NOT NULL,
    "value" numeric NOT NULL,
    "dims" "jsonb" DEFAULT '{}'::"jsonb",
    "dims_k" "text" GENERATED ALWAYS AS (COALESCE(("dims" ->> 'k'::"text"), ''::"text")) STORED NOT NULL
);


ALTER TABLE "public"."metrics_daily" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orgs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "plan_id" "text" DEFAULT 'basic'::"text" NOT NULL,
    "retention_days_override" integer
);


ALTER TABLE "public"."orgs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pattern_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_hash" "text" NOT NULL,
    "pattern_code" "text" NOT NULL,
    "confidence_level" numeric(3,2),
    "month_of" "date" NOT NULL,
    CONSTRAINT "pattern_insights_confidence_level_check" CHECK ((("confidence_level" >= (0)::numeric) AND ("confidence_level" <= (1)::numeric))),
    CONSTRAINT "pattern_insights_pattern_code_check" CHECK (("pattern_code" = ANY (ARRAY['STRESS_RISING'::"text", 'STRESS_STABLE'::"text", 'STRESS_DECLINING'::"text", 'BURNOUT_RISK'::"text", 'RECOVERY_PROGRESS'::"text", 'CONSISTENT_PRACTICE'::"text", 'IRREGULAR_PRACTICE'::"text", 'HIGH_PERFORMANCE'::"text", 'NEEDS_SUPPORT'::"text"])))
);


ALTER TABLE "public"."pattern_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "text" NOT NULL,
    "retention_days" integer NOT NULL
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


ALTER TABLE "public"."practice_sessions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."practice_sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."privacy_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action_type" "text" NOT NULL,
    "compliance_check" "jsonb" DEFAULT '{}'::"jsonb",
    "occurred_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "privacy_audit_logs_action_type_check" CHECK (("action_type" = ANY (ARRAY['data_accessed'::"text", 'report_generated'::"text", 'proof_created'::"text", 'metrics_aggregated'::"text", 'pattern_detected'::"text"])))
);


ALTER TABLE "public"."privacy_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "stripe_customer_id" "text",
    "subscription_status" "text",
    "subscription_tier" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "onboarding_completed" boolean DEFAULT false
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recommendation_categories" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text"
);


ALTER TABLE "public"."recommendation_categories" OWNER TO "postgres";


ALTER TABLE "public"."reflection_entries" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."reflection_entries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."reflection_entries_new" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entry_kind" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reflection_id" "text"
);


ALTER TABLE "public"."reflection_entries_new" OWNER TO "postgres";


COMMENT ON TABLE "public"."reflection_entries_new" IS 'Copy of reflection_entries for testing new queries/reports';



COMMENT ON COLUMN "public"."reflection_entries_new"."entry_kind" IS 'Type of reflection: wellness_checkin, post_assignment, teaming_prep, etc.';



ALTER TABLE "public"."reflection_entries_new" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."reflection_entries_new_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."reflection_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reflection_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reflections_lookup" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."reflections_lookup" OWNER TO "postgres";


ALTER TABLE "public"."stress_reset_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."stress_reset_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "text" NOT NULL,
    "user_id" "uuid",
    "status" "text" NOT NULL,
    "price_id" "text",
    "plan_name" "text",
    "plan_amount" integer,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_emotional_climate" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_hash" "text" NOT NULL,
    "dominant_emotion" "text" NOT NULL,
    "emotional_diversity" numeric(3,2),
    "volatility_index" numeric(3,2),
    "cohesion_score" numeric(3,2),
    "resilience_score" numeric(3,2),
    "contagion_risk" numeric(3,2),
    "trend_direction" "text",
    "measurement_period" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "team_emotional_climate_cohesion_score_check" CHECK ((("cohesion_score" >= (0)::numeric) AND ("cohesion_score" <= (10)::numeric))),
    CONSTRAINT "team_emotional_climate_contagion_risk_check" CHECK ((("contagion_risk" >= (0)::numeric) AND ("contagion_risk" <= (10)::numeric))),
    CONSTRAINT "team_emotional_climate_resilience_score_check" CHECK ((("resilience_score" >= (0)::numeric) AND ("resilience_score" <= (10)::numeric))),
    CONSTRAINT "team_emotional_climate_trend_direction_check" CHECK (("trend_direction" = ANY (ARRAY['improving'::"text", 'stable'::"text", 'declining'::"text"])))
);


ALTER TABLE "public"."team_emotional_climate" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."technique_usage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "technique_name" "text" NOT NULL,
    "technique_category" "text",
    "usage_count" integer DEFAULT 1,
    "effectiveness_rating" integer,
    "context" "text",
    "notes" "text",
    "last_used" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "timestamp" timestamp with time zone GENERATED ALWAYS AS ("last_used") STORED,
    CONSTRAINT "technique_usage_effectiveness_rating_check" CHECK ((("effectiveness_rating" >= 1) AND ("effectiveness_rating" <= 10))),
    CONSTRAINT "technique_usage_non_negative" CHECK (("usage_count" >= 0)),
    CONSTRAINT "technique_usage_technique_category_check" CHECK (("technique_category" = ANY (ARRAY['breathing'::"text", 'grounding'::"text", 'movement'::"text", 'visualization'::"text", 'cognitive'::"text", 'somatic'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."technique_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ui_preferences" (
    "user_id" "uuid" NOT NULL,
    "theme" "text" DEFAULT 'system'::"text",
    "compassion_mode" boolean DEFAULT true NOT NULL,
    "consent" "jsonb" DEFAULT '{"connect_wearable": false, "time_of_day_theming": true, "reduced_motion_override": false, "interaction_simplification": false}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ui_preferences_theme_check" CHECK (("theme" = ANY (ARRAY['system'::"text", 'light'::"text", 'dark'::"text"])))
);


ALTER TABLE "public"."ui_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_context_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recent_stress_patterns" "text"[],
    "recent_emotions" "text"[],
    "common_challenges" "text"[],
    "effective_strategies" "text"[],
    "avg_energy_level" numeric(3,2),
    "avg_stress_level" numeric(3,2),
    "avg_confidence_level" numeric(3,2),
    "burnout_risk_level" "text",
    "interpreter_experience_level" "text",
    "common_assignment_types" "text"[],
    "preferred_teaming_style" "text",
    "known_triggers" "text"[],
    "preferred_support_types" "text"[],
    "effective_interventions" "text"[],
    "communication_style" "text",
    "last_reflection_date" "date",
    "last_activity_date" "date",
    "context_score" numeric(3,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_context_summary_burnout_risk_level_check" CHECK (("burnout_risk_level" = ANY (ARRAY['low'::"text", 'moderate'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."user_context_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_growth_metrics" (
    "user_id" "uuid" NOT NULL,
    "preparedness_score" numeric(5,2),
    "self_awareness_level" numeric(5,2),
    "role_clarity_score" numeric(5,2),
    "ethical_awareness_score" numeric(5,2),
    "growth_mindset_score" numeric(5,2),
    "resilience_score" numeric(5,2),
    "overall_progress" numeric(5,2),
    "last_assessment" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_growth_metrics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_growth_stats" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "count"(DISTINCT "date"("created_at")) AS "days_active",
    "count"(*) AS "total_reflections",
    "count"(DISTINCT "entry_kind") AS "reflection_types_used",
    "max"("created_at") AS "last_activity",
    (EXTRACT(day FROM ("now"() - "min"("created_at"))))::integer AS "days_since_joined"
   FROM "public"."reflection_entries"
  GROUP BY "user_id";


ALTER VIEW "public"."user_growth_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_interventions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recommendation_id" "uuid" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "effectiveness_rating" integer,
    "notes" "text",
    CONSTRAINT "rating_range" CHECK ((("effectiveness_rating" IS NULL) OR (("effectiveness_rating" >= 1) AND ("effectiveness_rating" <= 5))))
);


ALTER TABLE "public"."user_interventions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "milestone_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "unlocked" boolean DEFAULT false NOT NULL,
    "progress" numeric DEFAULT 0,
    "unlocked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_milestones_progress_check" CHECK ((("progress" >= (0)::numeric) AND ("progress" <= (1)::numeric)))
);


ALTER TABLE "public"."user_milestones" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_preferences" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "theme",
    "compassion_mode",
    "consent",
    "updated_at"
   FROM "public"."ui_preferences";


ALTER VIEW "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_streaks" (
    "user_id" "uuid" NOT NULL,
    "current_streak" integer DEFAULT 0 NOT NULL,
    "longest_streak" integer DEFAULT 0 NOT NULL,
    "last_reflection_date" "date",
    "total_reflections" integer DEFAULT 0 NOT NULL,
    "compassion_breaks_used" integer DEFAULT 0 NOT NULL,
    "streak_start_date" "date",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_streaks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wellness_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_hash" "text" NOT NULL,
    "burnout_score" numeric(3,2),
    "stress_level" numeric(3,2),
    "energy_level" numeric(3,2),
    "confidence_score" numeric(3,2),
    "high_stress_pattern" boolean DEFAULT false,
    "recovery_needed" boolean DEFAULT false,
    "growth_trajectory" boolean DEFAULT false,
    "week_of" "date" NOT NULL,
    CONSTRAINT "wellness_metrics_burnout_score_check" CHECK ((("burnout_score" >= (0)::numeric) AND ("burnout_score" <= (10)::numeric))),
    CONSTRAINT "wellness_metrics_confidence_score_check" CHECK ((("confidence_score" >= (0)::numeric) AND ("confidence_score" <= (10)::numeric))),
    CONSTRAINT "wellness_metrics_energy_level_check" CHECK ((("energy_level" >= (0)::numeric) AND ("energy_level" <= (10)::numeric))),
    CONSTRAINT "wellness_metrics_stress_level_check" CHECK ((("stress_level" >= (0)::numeric) AND ("stress_level" <= (10)::numeric)))
);


ALTER TABLE "public"."wellness_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."zero_knowledge_proofs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proof_type" "text" NOT NULL,
    "proof_hash" "text" NOT NULL,
    "validates_criteria" "jsonb" NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    CONSTRAINT "zero_knowledge_proofs_proof_type_check" CHECK (("proof_type" = ANY (ARRAY['wellness_threshold_met'::"text", 'regular_practice_verified'::"text", 'improvement_demonstrated'::"text", 'risk_assessment_complete'::"text", 'compliance_verified'::"text"])))
);


ALTER TABLE "public"."zero_knowledge_proofs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."affirmation_favorites"
    ADD CONSTRAINT "affirmation_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."affirmation_favorites"
    ADD CONSTRAINT "affirmation_favorites_user_id_affirmation_id_key" UNIQUE ("user_id", "affirmation_id");



ALTER TABLE ONLY "public"."affirmations"
    ADD CONSTRAINT "affirmations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."affirmations"
    ADD CONSTRAINT "affirmations_user_id_affirmation_type_created_at_key" UNIQUE ("user_id", "affirmation_type", "created_at");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_sessions"
    ADD CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_sessions"
    ADD CONSTRAINT "analytics_sessions_session_id_key" UNIQUE ("session_id");



ALTER TABLE ONLY "public"."analytics_users"
    ADD CONSTRAINT "analytics_users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."anonymized_reflections"
    ADD CONSTRAINT "anonymized_reflections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."body_checkins"
    ADD CONSTRAINT "body_checkins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."burnout_alert_thresholds"
    ADD CONSTRAINT "burnout_alert_thresholds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."burnout_alerts"
    ADD CONSTRAINT "burnout_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."burnout_assessments"
    ADD CONSTRAINT "burnout_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."burnout_recommendations"
    ADD CONSTRAINT "burnout_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consent_flags"
    ADD CONSTRAINT "consent_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consent_flags"
    ADD CONSTRAINT "consent_flags_user_id_key_key" UNIQUE ("user_id", "key");



ALTER TABLE ONLY "public"."context_metrics"
    ADD CONSTRAINT "context_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."context_metrics"
    ADD CONSTRAINT "context_metrics_user_id_context_type_key" UNIQUE ("user_id", "context_type");



ALTER TABLE ONLY "public"."credential_events"
    ADD CONSTRAINT "credential_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_activity"
    ADD CONSTRAINT "daily_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_activity"
    ADD CONSTRAINT "daily_activity_user_id_activity_date_key" UNIQUE ("user_id", "activity_date");



ALTER TABLE ONLY "public"."daily_burnout_checks"
    ADD CONSTRAINT "daily_burnout_checks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_burnout_metrics"
    ADD CONSTRAINT "daily_burnout_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_burnout_metrics"
    ADD CONSTRAINT "daily_burnout_metrics_user_id_metric_date_key" UNIQUE ("user_id", "metric_date");



ALTER TABLE ONLY "public"."elya_conversations"
    ADD CONSTRAINT "elya_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emotion_tags"
    ADD CONSTRAINT "emotion_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emotional_contagion_patterns"
    ADD CONSTRAINT "emotional_contagion_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_definitions"
    ADD CONSTRAINT "event_definitions_pkey" PRIMARY KEY ("event_name");



ALTER TABLE ONLY "public"."feedback_logs"
    ADD CONSTRAINT "feedback_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."growth_insights"
    ADD CONSTRAINT "growth_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_logs"
    ADD CONSTRAINT "journal_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."metrics_daily"
    ADD CONSTRAINT "metrics_daily_pkey" PRIMARY KEY ("metric_date", "metric_name", "dims_k");



ALTER TABLE ONLY "public"."orgs"
    ADD CONSTRAINT "orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pattern_insights"
    ADD CONSTRAINT "pattern_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practice_sessions"
    ADD CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."privacy_audit_logs"
    ADD CONSTRAINT "privacy_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."recommendation_categories"
    ADD CONSTRAINT "recommendation_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recovery_habits"
    ADD CONSTRAINT "recovery_habits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reflection_entries_new"
    ADD CONSTRAINT "reflection_entries_new_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reflection_entries"
    ADD CONSTRAINT "reflection_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reflection_events"
    ADD CONSTRAINT "reflection_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reflections_lookup"
    ADD CONSTRAINT "reflections_lookup_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reflections"
    ADD CONSTRAINT "reflections_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."stress_reset_logs"
    ADD CONSTRAINT "stress_reset_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_emotional_climate"
    ADD CONSTRAINT "team_emotional_climate_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_emotional_climate"
    ADD CONSTRAINT "team_emotional_climate_team_hash_measurement_period_key" UNIQUE ("team_hash", "measurement_period");



ALTER TABLE ONLY "public"."technique_usage"
    ADD CONSTRAINT "technique_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ui_preferences"
    ADD CONSTRAINT "ui_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."burnout_alerts"
    ADD CONSTRAINT "unique_user_daily_alert" UNIQUE ("user_id", "alert_date");



ALTER TABLE ONLY "public"."daily_burnout_checks"
    ADD CONSTRAINT "unique_user_daily_check" UNIQUE ("user_id", "check_date");



ALTER TABLE ONLY "public"."burnout_alert_thresholds"
    ADD CONSTRAINT "unique_user_thresholds" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_context_summary"
    ADD CONSTRAINT "user_context_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_context_summary"
    ADD CONSTRAINT "user_context_summary_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_growth_metrics"
    ADD CONSTRAINT "user_growth_metrics_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_interventions"
    ADD CONSTRAINT "user_interventions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_user_id_milestone_id_key" UNIQUE ("user_id", "milestone_id");



ALTER TABLE ONLY "public"."user_streaks"
    ADD CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."wellness_metrics"
    ADD CONSTRAINT "wellness_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wellness_metrics"
    ADD CONSTRAINT "wellness_metrics_user_hash_week_of_key" UNIQUE ("user_hash", "week_of");



ALTER TABLE ONLY "public"."zero_knowledge_proofs"
    ADD CONSTRAINT "zero_knowledge_proofs_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_date" ON "public"."daily_activity" USING "btree" ("activity_date" DESC);



CREATE INDEX "idx_activity_user_id" ON "public"."daily_activity" USING "btree" ("user_id");



CREATE INDEX "idx_affirmation_favorites_affirmation" ON "public"."affirmation_favorites" USING "btree" ("affirmation_id");



CREATE INDEX "idx_affirmation_favorites_user" ON "public"."affirmation_favorites" USING "btree" ("user_id");



CREATE INDEX "idx_affirmation_favorites_user_affirmation" ON "public"."affirmation_favorites" USING "btree" ("user_id", "affirmation_id");



CREATE INDEX "idx_affirmations_user_created_at_desc" ON "public"."affirmations" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_affirmations_user_id" ON "public"."affirmations" USING "btree" ("user_id");



CREATE INDEX "idx_analytics_events_event_name" ON "public"."analytics_events" USING "btree" ("event_name");



CREATE INDEX "idx_analytics_events_occurred_at" ON "public"."analytics_events" USING "btree" ("occurred_at");



CREATE INDEX "idx_analytics_events_session_id" ON "public"."analytics_events" USING "btree" ("session_id");



CREATE INDEX "idx_analytics_events_user_id" ON "public"."analytics_events" USING "btree" ("user_id");



CREATE INDEX "idx_analytics_sessions_user_id" ON "public"."analytics_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_analytics_user_created" ON "public"."analytics_events" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_analytics_users_email_hash" ON "public"."analytics_users" USING "btree" ("email_hash");



CREATE INDEX "idx_app_users_org_id" ON "public"."app_users" USING "btree" ("org_id");



CREATE INDEX "idx_body_checkins_created" ON "public"."body_checkins" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_body_checkins_user" ON "public"."body_checkins" USING "btree" ("user_id");



CREATE INDEX "idx_body_checkins_user_created" ON "public"."body_checkins" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_body_checkins_user_id" ON "public"."body_checkins" USING "btree" ("user_id");



CREATE INDEX "idx_burnout_date" ON "public"."burnout_assessments" USING "btree" ("assessment_date" DESC);



CREATE INDEX "idx_burnout_recommendations_category_id" ON "public"."burnout_recommendations" USING "btree" ("category_id");



CREATE INDEX "idx_burnout_user_id" ON "public"."burnout_assessments" USING "btree" ("user_id");



CREATE INDEX "idx_consent_user_key" ON "public"."consent_flags" USING "btree" ("user_id", "key");



CREATE INDEX "idx_daily_activity_user_id" ON "public"."daily_activity" USING "btree" ("user_id");



CREATE INDEX "idx_daily_burnout_checks_user_date" ON "public"."daily_burnout_checks" USING "btree" ("user_id", "assessment_date");



CREATE INDEX "idx_daily_burnout_date" ON "public"."daily_burnout_metrics" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_daily_burnout_user" ON "public"."daily_burnout_metrics" USING "btree" ("user_id");



CREATE INDEX "idx_elya_conversations_user_recent" ON "public"."elya_conversations" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_emotion_tags_user_id" ON "public"."emotion_tags" USING "btree" ("user_id");



CREATE INDEX "idx_feedback_journal" ON "public"."feedback_logs" USING "btree" ("journal_id");



CREATE INDEX "idx_feedback_user_created" ON "public"."feedback_logs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_growth_insights_user_id" ON "public"."growth_insights" USING "btree" ("user_id");



CREATE INDEX "idx_journal_user_created" ON "public"."journal_logs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_orgs_plan_id" ON "public"."orgs" USING "btree" ("plan_id");



CREATE INDEX "idx_practice_sessions_user_type_created" ON "public"."practice_sessions" USING "btree" ("user_id", "session_type", "created_at" DESC);



CREATE INDEX "idx_profiles_id" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "idx_recovery_habits_type" ON "public"."recovery_habits" USING "btree" ("habit_type");



CREATE INDEX "idx_recovery_habits_user" ON "public"."recovery_habits" USING "btree" ("user_id");



CREATE INDEX "idx_recovery_habits_user_updated" ON "public"."recovery_habits" USING "btree" ("user_id", "updated_at");



CREATE INDEX "idx_reflection_created_at" ON "public"."reflection_entries" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_reflection_entries_new_created_at" ON "public"."reflection_entries_new" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_reflection_entries_new_data_gin" ON "public"."reflection_entries_new" USING "gin" ("data");



CREATE INDEX "idx_reflection_entries_new_kind" ON "public"."reflection_entries_new" USING "btree" ("entry_kind");



CREATE INDEX "idx_reflection_entries_new_user" ON "public"."reflection_entries_new" USING "btree" ("user_id");



CREATE INDEX "idx_reflection_entries_user_created" ON "public"."reflection_entries" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_reflection_entries_user_id" ON "public"."reflection_entries" USING "btree" ("user_id");



CREATE INDEX "idx_reflection_entry_kind" ON "public"."reflection_entries" USING "btree" ("entry_kind");



CREATE INDEX "idx_reflection_events_user_id" ON "public"."reflection_events" USING "btree" ("user_id");



CREATE INDEX "idx_reflection_user_id" ON "public"."reflection_entries" USING "btree" ("user_id");



CREATE INDEX "idx_reflections_user_id" ON "public"."reflections" USING "btree" ("user_id");



CREATE INDEX "idx_stress_created_at" ON "public"."stress_reset_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_stress_reset_logs_user_created" ON "public"."stress_reset_logs" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_stress_reset_logs_user_id" ON "public"."stress_reset_logs" USING "btree" ("user_id");



CREATE INDEX "idx_stress_tool_type" ON "public"."stress_reset_logs" USING "btree" ("tool_type");



CREATE INDEX "idx_stress_user_id" ON "public"."stress_reset_logs" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_user_status_created" ON "public"."subscriptions" USING "btree" ("user_id", "status", "created_at" DESC);



CREATE INDEX "idx_technique_usage_last" ON "public"."technique_usage" USING "btree" ("last_used" DESC);



CREATE INDEX "idx_technique_usage_name" ON "public"."technique_usage" USING "btree" ("technique_name");



CREATE INDEX "idx_technique_usage_user" ON "public"."technique_usage" USING "btree" ("user_id");



CREATE INDEX "idx_user_interventions_recommendation_id" ON "public"."user_interventions" USING "btree" ("recommendation_id");



CREATE INDEX "idx_user_interventions_user_id" ON "public"."user_interventions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "uniq_active_subscription_per_user" ON "public"."subscriptions" USING "btree" ("user_id") WHERE ("status" = 'active'::"text");



CREATE UNIQUE INDEX "ux_wellness_metrics_user_week" ON "public"."wellness_metrics" USING "btree" ("user_hash", "week_of");



CREATE OR REPLACE TRIGGER "body_checkins_set_updated_at" BEFORE UPDATE ON "public"."body_checkins" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "burnout_risk_monitor" AFTER INSERT OR UPDATE ON "public"."wellness_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."check_burnout_threshold"();



CREATE OR REPLACE TRIGGER "daily_burnout_metrics_set_updated_at" BEFORE UPDATE ON "public"."daily_burnout_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "emotional_contagion_monitor" AFTER INSERT ON "public"."emotional_contagion_patterns" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_contagion_intervention"();



CREATE OR REPLACE TRIGGER "recovery_habits_set_updated_at" BEFORE UPDATE ON "public"."recovery_habits" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "technique_usage_set_updated_at" BEFORE UPDATE ON "public"."technique_usage" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_reflections_lookup" AFTER INSERT OR DELETE OR UPDATE ON "public"."reflections" FOR EACH ROW EXECUTE FUNCTION "public"."reflections_lookup_sync"();



CREATE OR REPLACE TRIGGER "update_daily_activity_updated_at" BEFORE UPDATE ON "public"."daily_activity" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reflection_entries_updated_at" BEFORE UPDATE ON "public"."reflection_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."affirmation_favorites"
    ADD CONSTRAINT "affirmation_favorites_affirmation_id_fkey" FOREIGN KEY ("affirmation_id") REFERENCES "public"."affirmations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."affirmation_favorites"
    ADD CONSTRAINT "affirmation_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."affirmations"
    ADD CONSTRAINT "affirmations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_sessions"
    ADD CONSTRAINT "analytics_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id");



ALTER TABLE ONLY "public"."body_checkins"
    ADD CONSTRAINT "body_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."burnout_alert_thresholds"
    ADD CONSTRAINT "burnout_alert_thresholds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."burnout_alerts"
    ADD CONSTRAINT "burnout_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."burnout_assessments"
    ADD CONSTRAINT "burnout_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."burnout_recommendations"
    ADD CONSTRAINT "burnout_recommendations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."recommendation_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consent_flags"
    ADD CONSTRAINT "consent_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."context_metrics"
    ADD CONSTRAINT "context_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_activity"
    ADD CONSTRAINT "daily_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_burnout_checks"
    ADD CONSTRAINT "daily_burnout_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_burnout_metrics"
    ADD CONSTRAINT "daily_burnout_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."elya_conversations"
    ADD CONSTRAINT "elya_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."emotion_tags"
    ADD CONSTRAINT "emotion_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback_logs"
    ADD CONSTRAINT "feedback_logs_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "public"."journal_logs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feedback_logs"
    ADD CONSTRAINT "feedback_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."growth_insights"
    ADD CONSTRAINT "growth_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_logs"
    ADD CONSTRAINT "journal_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orgs"
    ADD CONSTRAINT "orgs_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id");



ALTER TABLE ONLY "public"."practice_sessions"
    ADD CONSTRAINT "practice_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."recovery_habits"
    ADD CONSTRAINT "recovery_habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reflection_entries_new"
    ADD CONSTRAINT "reflection_entries_new_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reflection_entries"
    ADD CONSTRAINT "reflection_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reflection_events"
    ADD CONSTRAINT "reflection_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reflections"
    ADD CONSTRAINT "reflections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stress_reset_logs"
    ADD CONSTRAINT "stress_reset_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."technique_usage"
    ADD CONSTRAINT "technique_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ui_preferences"
    ADD CONSTRAINT "ui_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_context_summary"
    ADD CONSTRAINT "user_context_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_growth_metrics"
    ADD CONSTRAINT "user_growth_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interventions"
    ADD CONSTRAINT "user_interventions_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "public"."burnout_recommendations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interventions"
    ADD CONSTRAINT "user_interventions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_streaks"
    ADD CONSTRAINT "user_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view affirmations" ON "public"."affirmations" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Audit logs for compliance officers" ON "public"."privacy_audit_logs" FOR SELECT TO "authenticated" USING ((((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'compliance_officer'::"text") OR ((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'service_role'::"text")));



CREATE POLICY "Everyone can view burnout recommendations" ON "public"."burnout_recommendations" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Everyone can view emotion tags" ON "public"."emotion_tags" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Everyone can view recommendation categories" ON "public"."recommendation_categories" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Own rows - delete" ON "public"."reflection_entries_new" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Own rows - insert" ON "public"."reflection_entries_new" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Own rows - select" ON "public"."reflection_entries_new" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Own rows - update" ON "public"."reflection_entries_new" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Profiles insert own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Profiles select own" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Profiles update own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Proofs are public validation" ON "public"."zero_knowledge_proofs" FOR SELECT USING (true);



CREATE POLICY "Public read wellness metrics" ON "public"."wellness_metrics" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Service role full access to contagion patterns" ON "public"."emotional_contagion_patterns" TO "authenticated" USING (((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'service_role'::"text")) WITH CHECK (((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access to team climate" ON "public"."team_emotional_climate" TO "authenticated" USING (((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'service_role'::"text")) WITH CHECK (((( SELECT "auth"."jwt"() AS "jwt") ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Users can delete own alert thresholds" ON "public"."burnout_alert_thresholds" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own burnout alerts" ON "public"."burnout_alerts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own burnout assessments" ON "public"."burnout_assessments" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own burnout checks" ON "public"."daily_burnout_checks" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own daily activity" ON "public"."daily_activity" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own interventions" ON "public"."user_interventions" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own reflections" ON "public"."reflection_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own reflections" ON "public"."reflections" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own stress logs" ON "public"."stress_reset_logs" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own reflections" ON "public"."reflection_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert anonymized data" ON "public"."anonymized_reflections" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert own alert thresholds" ON "public"."burnout_alert_thresholds" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own burnout alerts" ON "public"."burnout_alerts" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own burnout assessments" ON "public"."burnout_assessments" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own burnout checks" ON "public"."daily_burnout_checks" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own context metrics" ON "public"."context_metrics" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own daily activity" ON "public"."daily_activity" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own insights" ON "public"."growth_insights" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own interventions" ON "public"."user_interventions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own metrics" ON "public"."user_growth_metrics" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own reflections" ON "public"."reflection_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own reflections" ON "public"."reflections" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own stress logs" ON "public"."stress_reset_logs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own UI preferences" ON "public"."ui_preferences" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own milestones" ON "public"."user_milestones" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own reflections" ON "public"."reflection_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their reflection events" ON "public"."reflection_events" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their user streaks" ON "public"."user_streaks" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own alert thresholds" ON "public"."burnout_alert_thresholds" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own burnout alerts" ON "public"."burnout_alerts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own burnout assessments" ON "public"."burnout_assessments" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own burnout checks" ON "public"."daily_burnout_checks" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own context metrics" ON "public"."context_metrics" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own daily activity" ON "public"."daily_activity" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own insights" ON "public"."growth_insights" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own interventions" ON "public"."user_interventions" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own metrics" ON "public"."user_growth_metrics" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own reflections" ON "public"."reflection_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own reflections" ON "public"."reflections" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own stress logs" ON "public"."stress_reset_logs" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own UI preferences" ON "public"."ui_preferences" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own milestones" ON "public"."user_milestones" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own reflections" ON "public"."reflection_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their reflection events" ON "public"."reflection_events" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view aggregated metrics" ON "public"."wellness_metrics" FOR SELECT USING (true);



CREATE POLICY "Users can view own alert thresholds" ON "public"."burnout_alert_thresholds" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own burnout alerts" ON "public"."burnout_alerts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own burnout assessments" ON "public"."burnout_assessments" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own burnout checks" ON "public"."daily_burnout_checks" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own context metrics" ON "public"."context_metrics" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own daily activity" ON "public"."daily_activity" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own insights" ON "public"."growth_insights" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own interventions" ON "public"."user_interventions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own metrics" ON "public"."user_growth_metrics" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view own reflections" ON "public"."reflection_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own reflections" ON "public"."reflections" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own stress logs" ON "public"."stress_reset_logs" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own subscriptions" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own UI preferences" ON "public"."ui_preferences" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own milestones" ON "public"."user_milestones" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own reflections" ON "public"."reflection_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their reflection events" ON "public"."reflection_events" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their user streaks" ON "public"."user_streaks" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "View patterns without identification" ON "public"."pattern_insights" FOR SELECT USING (true);



CREATE POLICY "ae_insert_own" ON "public"."analytics_events" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "ae_select_own" ON "public"."analytics_events" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "af_delete_own" ON "public"."affirmation_favorites" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "af_insert_own" ON "public"."affirmation_favorites" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "af_select_own" ON "public"."affirmation_favorites" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "af_update_own" ON "public"."affirmation_favorites" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."affirmation_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."affirmations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "affirmations_delete_own" ON "public"."affirmations" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "affirmations_insert_own" ON "public"."affirmations" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "affirmations_select_own" ON "public"."affirmations" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "affirmations_update_own" ON "public"."affirmations" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "analytics: insert own" ON "public"."analytics_events" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "analytics: read own" ON "public"."analytics_events" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."anonymized_reflections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "au_delete_self" ON "public"."analytics_users" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "au_insert_self" ON "public"."analytics_users" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "au_select_own" ON "public"."analytics_users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "au_select_own" ON "public"."app_users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "au_update_own" ON "public"."app_users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "au_update_self" ON "public"."analytics_users" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."body_checkins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "body_checkins: delete own" ON "public"."body_checkins" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "body_checkins: insert own" ON "public"."body_checkins" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "body_checkins: select own" ON "public"."body_checkins" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "body_checkins: update own" ON "public"."body_checkins" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."burnout_alert_thresholds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."burnout_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."burnout_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."burnout_recommendations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "client_rw_own" ON "public"."analytics_sessions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "client_rw_self" ON "public"."consent_flags" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "client_upsert_self" ON "public"."analytics_users" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "consent: delete own" ON "public"."consent_flags" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "consent: insert own" ON "public"."consent_flags" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "consent: read own" ON "public"."consent_flags" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "consent: update own" ON "public"."consent_flags" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."consent_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."context_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credential_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_burnout_checks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_burnout_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dbm_delete_own" ON "public"."daily_burnout_metrics" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "dbm_insert_own" ON "public"."daily_burnout_metrics" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "dbm_select_own" ON "public"."daily_burnout_metrics" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "dbm_update_own" ON "public"."daily_burnout_metrics" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ec_delete_own" ON "public"."elya_conversations" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ec_insert_own" ON "public"."elya_conversations" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ec_select_own" ON "public"."elya_conversations" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ec_update_own" ON "public"."elya_conversations" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ed_public_read" ON "public"."event_definitions" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."elya_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."emotion_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."emotional_contagion_patterns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_definitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "feedback: insert own" ON "public"."feedback_logs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "feedback: read own" ON "public"."feedback_logs" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."feedback_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."growth_insights" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "journal: insert own" ON "public"."journal_logs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "journal: read own" ON "public"."journal_logs" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "journal: update own" ON "public"."journal_logs" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."journal_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "md_public_read" ON "public"."metrics_daily" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."metrics_daily" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orgs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orgs_member_read" ON "public"."orgs" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "app_users"."org_id"
   FROM "public"."app_users"
  WHERE ("app_users"."id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "owner can insert ledger" ON "public"."credential_events" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "owner can read ledger" ON "public"."credential_events" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."pattern_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "plans_public_read" ON "public"."plans" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."practice_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."privacy_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ps_delete_own" ON "public"."practice_sessions" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ps_insert_own" ON "public"."practice_sessions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ps_select_own" ON "public"."practice_sessions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ps_update_own" ON "public"."practice_sessions" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "re_delete_own" ON "public"."reflection_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "re_insert_own" ON "public"."reflection_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "re_select_own" ON "public"."reflection_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "re_update_own" ON "public"."reflection_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."recommendation_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recovery_habits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reflection_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reflection_entries_new" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reflection_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reflections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reflections_lookup" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rh_delete_own" ON "public"."recovery_habits" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "rh_insert_own" ON "public"."recovery_habits" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "rh_select_own" ON "public"."recovery_habits" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "rh_update_own" ON "public"."recovery_habits" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "service_full" ON "public"."analytics_sessions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_full" ON "public"."analytics_users" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_full" ON "public"."app_users" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_full" ON "public"."consent_flags" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_full" ON "public"."orgs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_full" ON "public"."reflections_lookup" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."stress_reset_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_emotional_climate" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."technique_usage" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tu_delete_own" ON "public"."technique_usage" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "tu_insert_own" ON "public"."technique_usage" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "tu_select_own" ON "public"."technique_usage" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "tu_update_own" ON "public"."technique_usage" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ucs_delete_own" ON "public"."user_context_summary" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ucs_insert_own" ON "public"."user_context_summary" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ucs_select_own" ON "public"."user_context_summary" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "ucs_update_own" ON "public"."user_context_summary" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."ui_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_context_summary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_growth_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_interventions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_streaks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wellness_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."zero_knowledge_proofs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."analyze_burnout_patterns"("p_timeframe" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_burnout_patterns"("p_timeframe" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_burnout_patterns"("p_timeframe" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."analyze_contagion_research_data"("p_timeframe" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_contagion_research_data"("p_timeframe" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_contagion_research_data"("p_timeframe" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."assess_team_burnout_risk"("p_org_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."assess_team_burnout_risk"("p_org_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assess_team_burnout_risk"("p_org_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_burnout_threshold"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_burnout_threshold"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_burnout_threshold"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_hash"("user_id" "uuid", "salt" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_hash"("user_id" "uuid", "salt" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_hash"("user_id" "uuid", "salt" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_emotional_contagion"("p_team_hash" "text", "p_time_window" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."detect_emotional_contagion"("p_team_hash" "text", "p_time_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_emotional_contagion"("p_team_hash" "text", "p_time_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_compliance_report"("org_id" "text", "date_from" "date", "date_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_compliance_report"("org_id" "text", "date_from" "date", "date_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_compliance_report"("org_id" "text", "date_from" "date", "date_to" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_emotional_weather_map"("p_org_id" "text", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_emotional_weather_map"("p_org_id" "text", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_emotional_weather_map"("p_org_id" "text", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_streak"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_streak"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_streak"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."identify_positive_influencers"("p_team_hash" "text", "p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."identify_positive_influencers"("p_team_hash" "text", "p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."identify_positive_influencers"("p_team_hash" "text", "p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."issue_credential_event"("p_user" "uuid", "p_type" "text", "p_ref" "text", "p_payload" "jsonb", "p_verifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."issue_credential_event"("p_user" "uuid", "p_type" "text", "p_ref" "text", "p_payload" "jsonb", "p_verifier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."issue_credential_event"("p_user" "uuid", "p_type" "text", "p_ref" "text", "p_payload" "jsonb", "p_verifier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."predict_burnout_risk_zkwv"("p_user_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."predict_burnout_risk_zkwv"("p_user_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."predict_burnout_risk_zkwv"("p_user_hash" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."purge_old_reflections"() TO "anon";
GRANT ALL ON FUNCTION "public"."purge_old_reflections"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."purge_old_reflections"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reflections_lookup_sync"() TO "anon";
GRANT ALL ON FUNCTION "public"."reflections_lookup_sync"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reflections_lookup_sync"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_contagion_intervention"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_contagion_intervention"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_contagion_intervention"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_wellness_threshold"("user_hash_input" "text", "threshold_type" "text", "threshold_value" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."verify_wellness_threshold"("user_hash_input" "text", "threshold_type" "text", "threshold_value" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_wellness_threshold"("user_hash_input" "text", "threshold_type" "text", "threshold_value" numeric) TO "service_role";












SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;









GRANT ALL ON TABLE "public"."affirmation_favorites" TO "anon";
GRANT ALL ON TABLE "public"."affirmation_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."affirmation_favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."affirmation_favorites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."affirmation_favorites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."affirmation_favorites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."affirmations" TO "anon";
GRANT ALL ON TABLE "public"."affirmations" TO "authenticated";
GRANT ALL ON TABLE "public"."affirmations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."affirmations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."affirmations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."affirmations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_sessions" TO "anon";
GRANT ALL ON TABLE "public"."analytics_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_sessions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."analytics_sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."analytics_sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."analytics_sessions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_users" TO "anon";
GRANT ALL ON TABLE "public"."analytics_users" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_users" TO "service_role";



GRANT ALL ON TABLE "public"."anonymized_reflections" TO "anon";
GRANT ALL ON TABLE "public"."anonymized_reflections" TO "authenticated";
GRANT ALL ON TABLE "public"."anonymized_reflections" TO "service_role";



GRANT ALL ON TABLE "public"."app_users" TO "anon";
GRANT ALL ON TABLE "public"."app_users" TO "authenticated";
GRANT ALL ON TABLE "public"."app_users" TO "service_role";



GRANT ALL ON TABLE "public"."practice_sessions" TO "anon";
GRANT ALL ON TABLE "public"."practice_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."practice_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."body_awareness_sessions" TO "anon";
GRANT ALL ON TABLE "public"."body_awareness_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."body_awareness_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."body_checkins" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."body_checkins" TO "authenticated";
GRANT ALL ON TABLE "public"."body_checkins" TO "service_role";



GRANT ALL ON TABLE "public"."body_check_ins" TO "anon";
GRANT ALL ON TABLE "public"."body_check_ins" TO "authenticated";
GRANT ALL ON TABLE "public"."body_check_ins" TO "service_role";



GRANT ALL ON TABLE "public"."boundaries_sessions" TO "anon";
GRANT ALL ON TABLE "public"."boundaries_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."boundaries_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."burnout_alert_thresholds" TO "anon";
GRANT ALL ON TABLE "public"."burnout_alert_thresholds" TO "authenticated";
GRANT ALL ON TABLE "public"."burnout_alert_thresholds" TO "service_role";



GRANT ALL ON TABLE "public"."burnout_alerts" TO "anon";
GRANT ALL ON TABLE "public"."burnout_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."burnout_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."burnout_assessments" TO "anon";
GRANT ALL ON TABLE "public"."burnout_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."burnout_assessments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."burnout_assessments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."burnout_assessments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."burnout_assessments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."burnout_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."burnout_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."burnout_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."code_switch_sessions" TO "anon";
GRANT ALL ON TABLE "public"."code_switch_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."code_switch_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."consent_flags" TO "anon";
GRANT ALL ON TABLE "public"."consent_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."consent_flags" TO "service_role";



GRANT ALL ON TABLE "public"."context_metrics" TO "anon";
GRANT ALL ON TABLE "public"."context_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."context_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."credential_events" TO "anon";
GRANT ALL ON TABLE "public"."credential_events" TO "authenticated";
GRANT ALL ON TABLE "public"."credential_events" TO "service_role";



GRANT ALL ON TABLE "public"."daily_activity" TO "anon";
GRANT ALL ON TABLE "public"."daily_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_activity" TO "service_role";



GRANT ALL ON SEQUENCE "public"."daily_activity_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."daily_activity_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."daily_activity_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."daily_burnout_checks" TO "anon";
GRANT ALL ON TABLE "public"."daily_burnout_checks" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_burnout_checks" TO "service_role";



GRANT ALL ON TABLE "public"."daily_burnout_metrics" TO "anon";
GRANT ALL ON TABLE "public"."daily_burnout_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_burnout_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."elya_conversations" TO "anon";
GRANT ALL ON TABLE "public"."elya_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."elya_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."emotion_tags" TO "anon";
GRANT ALL ON TABLE "public"."emotion_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."emotion_tags" TO "service_role";



GRANT ALL ON TABLE "public"."emotional_contagion_patterns" TO "anon";
GRANT ALL ON TABLE "public"."emotional_contagion_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."emotional_contagion_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."emotional_proximity_sessions" TO "anon";
GRANT ALL ON TABLE "public"."emotional_proximity_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."emotional_proximity_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."event_definitions" TO "anon";
GRANT ALL ON TABLE "public"."event_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."event_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."feedback_logs" TO "anon";
GRANT ALL ON TABLE "public"."feedback_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_logs" TO "service_role";



GRANT ALL ON TABLE "public"."gi_body_checkins" TO "anon";
GRANT ALL ON TABLE "public"."gi_body_checkins" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_body_checkins" TO "service_role";



GRANT ALL ON TABLE "public"."gi_burnout_daily" TO "anon";
GRANT ALL ON TABLE "public"."gi_burnout_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_burnout_daily" TO "service_role";



GRANT ALL ON TABLE "public"."recovery_habits" TO "anon";
GRANT ALL ON TABLE "public"."recovery_habits" TO "authenticated";
GRANT ALL ON TABLE "public"."recovery_habits" TO "service_role";



GRANT ALL ON TABLE "public"."gi_recovery_balance" TO "anon";
GRANT ALL ON TABLE "public"."gi_recovery_balance" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_recovery_balance" TO "service_role";



GRANT ALL ON TABLE "public"."reflections" TO "anon";
GRANT ALL ON TABLE "public"."reflections" TO "authenticated";
GRANT ALL ON TABLE "public"."reflections" TO "service_role";



GRANT ALL ON TABLE "public"."gi_reflections_summary" TO "anon";
GRANT ALL ON TABLE "public"."gi_reflections_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_reflections_summary" TO "service_role";



GRANT ALL ON TABLE "public"."stress_reset_logs" TO "anon";
GRANT ALL ON TABLE "public"."stress_reset_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."stress_reset_logs" TO "service_role";



GRANT ALL ON TABLE "public"."gi_reset_toolkit" TO "anon";
GRANT ALL ON TABLE "public"."gi_reset_toolkit" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_reset_toolkit" TO "service_role";



GRANT ALL ON TABLE "public"."gi_stress_energy" TO "anon";
GRANT ALL ON TABLE "public"."gi_stress_energy" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_stress_energy" TO "service_role";



GRANT ALL ON TABLE "public"."reflection_entries" TO "anon";
GRANT ALL ON TABLE "public"."reflection_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."reflection_entries" TO "service_role";



GRANT ALL ON TABLE "public"."gi_teamwork" TO "anon";
GRANT ALL ON TABLE "public"."gi_teamwork" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_teamwork" TO "service_role";



GRANT ALL ON TABLE "public"."gi_teamwork_v2" TO "anon";
GRANT ALL ON TABLE "public"."gi_teamwork_v2" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_teamwork_v2" TO "service_role";



GRANT ALL ON TABLE "public"."gi_values_focus" TO "anon";
GRANT ALL ON TABLE "public"."gi_values_focus" TO "authenticated";
GRANT ALL ON TABLE "public"."gi_values_focus" TO "service_role";



GRANT ALL ON TABLE "public"."growth_insights" TO "anon";
GRANT ALL ON TABLE "public"."growth_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."growth_insights" TO "service_role";



GRANT ALL ON TABLE "public"."journal_logs" TO "anon";
GRANT ALL ON TABLE "public"."journal_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_logs" TO "service_role";



GRANT ALL ON TABLE "public"."metrics_daily" TO "anon";
GRANT ALL ON TABLE "public"."metrics_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."metrics_daily" TO "service_role";



GRANT ALL ON TABLE "public"."orgs" TO "anon";
GRANT ALL ON TABLE "public"."orgs" TO "authenticated";
GRANT ALL ON TABLE "public"."orgs" TO "service_role";



GRANT ALL ON TABLE "public"."pattern_insights" TO "anon";
GRANT ALL ON TABLE "public"."pattern_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."pattern_insights" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."practice_sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."practice_sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."practice_sessions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."privacy_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."privacy_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."privacy_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recommendation_categories" TO "anon";
GRANT ALL ON TABLE "public"."recommendation_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."recommendation_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reflection_entries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reflection_entries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reflection_entries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reflection_entries_new" TO "anon";
GRANT ALL ON TABLE "public"."reflection_entries_new" TO "authenticated";
GRANT ALL ON TABLE "public"."reflection_entries_new" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reflection_entries_new_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reflection_entries_new_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reflection_entries_new_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reflection_events" TO "anon";
GRANT ALL ON TABLE "public"."reflection_events" TO "authenticated";
GRANT ALL ON TABLE "public"."reflection_events" TO "service_role";



GRANT ALL ON TABLE "public"."reflections_lookup" TO "anon";
GRANT ALL ON TABLE "public"."reflections_lookup" TO "authenticated";
GRANT ALL ON TABLE "public"."reflections_lookup" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stress_reset_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stress_reset_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stress_reset_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."team_emotional_climate" TO "anon";
GRANT ALL ON TABLE "public"."team_emotional_climate" TO "authenticated";
GRANT ALL ON TABLE "public"."team_emotional_climate" TO "service_role";



GRANT ALL ON TABLE "public"."technique_usage" TO "anon";
GRANT ALL ON TABLE "public"."technique_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."technique_usage" TO "service_role";



GRANT ALL ON TABLE "public"."ui_preferences" TO "anon";
GRANT ALL ON TABLE "public"."ui_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."ui_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_context_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_context_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_context_summary" TO "service_role";



GRANT ALL ON TABLE "public"."user_growth_metrics" TO "anon";
GRANT ALL ON TABLE "public"."user_growth_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."user_growth_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."user_growth_stats" TO "anon";
GRANT ALL ON TABLE "public"."user_growth_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."user_growth_stats" TO "service_role";



GRANT ALL ON TABLE "public"."user_interventions" TO "anon";
GRANT ALL ON TABLE "public"."user_interventions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_interventions" TO "service_role";



GRANT ALL ON TABLE "public"."user_milestones" TO "anon";
GRANT ALL ON TABLE "public"."user_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."user_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_streaks" TO "anon";
GRANT ALL ON TABLE "public"."user_streaks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_streaks" TO "service_role";



GRANT ALL ON TABLE "public"."wellness_metrics" TO "anon";
GRANT ALL ON TABLE "public"."wellness_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."wellness_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."zero_knowledge_proofs" TO "anon";
GRANT ALL ON TABLE "public"."zero_knowledge_proofs" TO "authenticated";
GRANT ALL ON TABLE "public"."zero_knowledge_proofs" TO "service_role";









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






























RESET ALL;
