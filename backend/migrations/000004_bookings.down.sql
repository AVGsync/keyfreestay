DROP TRIGGER IF EXISTS bookings_set_updated_at ON bookings;
DROP TABLE IF EXISTS bookings;
DROP TYPE IF EXISTS booking_status;
DROP EXTENSION IF EXISTS btree_gist;