-- Create terms_acceptances table for tracking user acceptance of terms and privacy policies
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    terms_version VARCHAR(50) NOT NULL,
    privacy_version VARCHAR(50) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ip_address VARCHAR(45), -- Supports IPv6
    user_agent TEXT,
    terms_content_hash VARCHAR(64),
    privacy_content_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_terms_user_id ON public.terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_accepted_at ON public.terms_acceptances(accepted_at);
CREATE INDEX IF NOT EXISTS idx_terms_versions ON public.terms_acceptances(terms_version, privacy_version);

-- Add columns to profiles table if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS privacy_version VARCHAR(50);

-- Enable Row Level Security
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own acceptance records
CREATE POLICY "Users can view own terms acceptances" ON public.terms_acceptances
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own acceptance records
CREATE POLICY "Users can create own terms acceptances" ON public.terms_acceptances
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin users can view all acceptance records (optional, adjust role as needed)
CREATE POLICY "Admins can view all terms acceptances" ON public.terms_acceptances
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create a function to check if user has accepted current terms
CREATE OR REPLACE FUNCTION public.has_accepted_current_terms(
    p_user_id UUID,
    p_terms_version VARCHAR,
    p_privacy_version VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.terms_acceptances
        WHERE user_id = p_user_id
        AND terms_version = p_terms_version
        AND privacy_version = p_privacy_version
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get latest acceptance for a user
CREATE OR REPLACE FUNCTION public.get_latest_terms_acceptance(p_user_id UUID)
RETURNS TABLE (
    terms_version VARCHAR,
    privacy_version VARCHAR,
    accepted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT ta.terms_version, ta.privacy_version, ta.accepted_at
    FROM public.terms_acceptances ta
    WHERE ta.user_id = p_user_id
    ORDER BY ta.accepted_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.terms_acceptances TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_accepted_current_terms TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_terms_acceptance TO authenticated;