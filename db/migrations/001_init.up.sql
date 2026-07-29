BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  name text NOT NULL,
  gender text NOT NULL,
  university_email text NOT NULL UNIQUE,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_gender_check CHECK (gender IN ('female', 'male', 'none'))
);

CREATE TABLE trip_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  recruitment_close_method text NOT NULL,
  target_capacity integer NOT NULL CHECK (target_capacity BETWEEN 2 AND 4),
  status text NOT NULL,
  allow_nearby boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  expired_at timestamptz,
  CONSTRAINT trip_groups_status_check CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'CONFIRMED', 'IN_PROGRESS', 'SETTLEMENT_PENDING', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  CONSTRAINT trip_groups_close_method_check CHECK (recruitment_close_method IN ('departure-time', 'host'))
);

CREATE INDEX trip_groups_host_user_id_idx ON trip_groups (host_user_id);
CREATE INDEX trip_groups_status_departure_time_idx ON trip_groups (status, departure_time);

CREATE TABLE trip_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_group_id uuid NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role text NOT NULL,
  status text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  deposited_at timestamptz,
  checked_in_at timestamptz,
  no_show_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  CONSTRAINT trip_participants_role_check CHECK (role IN ('host', 'member')),
  CONSTRAINT trip_participants_status_check CHECK (status IN ('APPLIED', 'APPROVED', 'DEPOSITED', 'CHECKED_IN', 'NO_SHOW', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT trip_participants_trip_user_unique UNIQUE (trip_group_id, user_id)
);

CREATE INDEX trip_participants_trip_group_id_idx ON trip_participants (trip_group_id, status);
CREATE INDEX trip_participants_user_id_idx ON trip_participants (user_id, status);

CREATE TABLE fare_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_group_id uuid NOT NULL UNIQUE REFERENCES trip_groups(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  provider_basis text NOT NULL,
  distance_meters integer NOT NULL CHECK (distance_meters >= 0),
  duration_seconds integer NOT NULL CHECK (duration_seconds >= 0),
  estimated_total integer NOT NULL CHECK (estimated_total >= 0),
  normalized_route jsonb NOT NULL,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE match_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_trip_group_id uuid REFERENCES trip_groups(id) ON DELETE SET NULL,
  normalized_route jsonb NOT NULL,
  score numeric(7, 3) NOT NULL,
  recommendation_reason text NOT NULL,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX match_recommendations_requester_user_id_calculated_at_idx
  ON match_recommendations (requester_user_id, calculated_at DESC);

CREATE TABLE settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_group_id uuid NOT NULL UNIQUE REFERENCES trip_groups(id) ON DELETE CASCADE,
  estimated_total integer NOT NULL CHECK (estimated_total >= 0),
  actual_total integer NOT NULL CHECK (actual_total >= 0),
  settlement_participant_count integer NOT NULL CHECK (settlement_participant_count >= 1),
  estimated_per_person integer NOT NULL CHECK (estimated_per_person >= 0),
  final_per_person integer NOT NULL CHECK (final_per_person >= 0),
  delta_per_person integer NOT NULL,
  status text NOT NULL,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT settlements_status_check CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE point_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  actor_user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  related_trip_group_id uuid REFERENCES trip_groups(id) ON DELETE SET NULL,
  reason text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  amount integer NOT NULL,
  balance_effect integer NOT NULL,
  resulting_balance integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX point_ledger_user_id_created_at_idx ON point_ledger (user_id, created_at DESC);
CREATE INDEX point_ledger_related_trip_group_id_idx ON point_ledger (related_trip_group_id);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  target_trip_group_id uuid REFERENCES trip_groups(id) ON DELETE CASCADE,
  category text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT reports_status_check CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'))
);

CREATE INDEX reports_status_created_at_idx ON reports (status, created_at DESC);

CREATE TABLE blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  lifted_at timestamptz,
  CONSTRAINT blocks_unique_pair UNIQUE (blocker_user_id, blocked_user_id)
);

CREATE INDEX blocks_blocker_user_id_idx ON blocks (blocker_user_id, created_at DESC);
CREATE INDEX blocks_blocked_user_id_idx ON blocks (blocked_user_id, created_at DESC);

COMMIT;
