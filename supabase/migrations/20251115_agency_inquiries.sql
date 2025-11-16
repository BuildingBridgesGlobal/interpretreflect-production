-- Create table for agency inquiries
CREATE TABLE agency_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  team_size TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE agency_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anon to create inquiries" ON agency_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view inquiries" ON agency_inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update inquiries" ON agency_inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON agency_inquiries TO anon, authenticated;

-- Create index for efficient querying
CREATE INDEX idx_agency_inquiries_status ON agency_inquiries(status);
CREATE INDEX idx_agency_inquiries_created_at ON agency_inquiries(created_at DESC);