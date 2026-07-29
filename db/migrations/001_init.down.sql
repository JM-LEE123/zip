BEGIN;

DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS point_ledger;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS match_recommendations;
DROP TABLE IF EXISTS fare_estimates;
DROP TABLE IF EXISTS trip_participants;
DROP TABLE IF EXISTS trip_groups;
DROP TABLE IF EXISTS users;

COMMIT;
