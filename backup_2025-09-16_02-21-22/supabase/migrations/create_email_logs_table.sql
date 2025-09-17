-- Create email_logs table for tracking all sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent',
  metadata JSONB,
  error_message TEXT
);

-- Create indexes for efficient querying
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all emails
CREATE POLICY "Admin can view all emails" ON email_logs
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('hello@huviatechnologies.com', 'admin@interpretreflect.com')
    )
  );

-- Users can view their own emails
CREATE POLICY "Users can view own emails" ON email_logs
  FOR SELECT
  USING (auth.uid() = user_id);