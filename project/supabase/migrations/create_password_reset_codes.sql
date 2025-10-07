-- Create table for password reset codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Create index for faster lookups
CREATE INDEX idx_reset_codes_email ON password_reset_codes(email);
CREATE INDEX idx_reset_codes_code ON password_reset_codes(code);
CREATE INDEX idx_reset_codes_expires ON password_reset_codes(expires_at);

-- Clean up old codes automatically (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_codes
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up a cron job to clean expired codes daily
-- This requires pg_cron extension
-- SELECT cron.schedule('cleanup-reset-codes', '0 2 * * *', 'SELECT cleanup_expired_reset_codes();');