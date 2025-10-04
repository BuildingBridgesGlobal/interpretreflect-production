-- Create burnout_assessments table for tracking daily burnout checks
CREATE TABLE burnout_assessments (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    assessment_date DATE NOT NULL,

    -- Individual metric scores (1-5 scale)
    energy_tank INTEGER CHECK (energy_tank >= 1 AND energy_tank <= 5),
    recovery_speed INTEGER CHECK (recovery_speed >= 1 AND recovery_speed <= 5),
    emotional_leakage INTEGER CHECK (emotional_leakage >= 1 AND emotional_leakage <= 5),
    performance_signal INTEGER CHECK (performance_signal >= 1 AND performance_signal <= 5),
    tomorrow_readiness INTEGER CHECK (tomorrow_readiness >= 1 AND tomorrow_readiness <= 5),

    -- Aggregate scores
    total_score NVARCHAR(10) NOT NULL, -- Stored as text but represents 5-25
    risk_level NVARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')),

    -- Timestamps
    created_at DATETIME2 DEFAULT GETUTCDATE() NOT NULL,
    updated_at DATETIME2 DEFAULT GETUTCDATE() NOT NULL,

    -- Ensure one assessment per day per user
    CONSTRAINT unique_daily_assessment UNIQUE (user_id, assessment_date)
);

-- Create index for faster queries
CREATE INDEX idx_burnout_assessments_user_date
    ON burnout_assessments (user_id, assessment_date DESC);

-- Note: Row Level Security is not available in SQL Server
-- Security should be implemented at the application level or using SQL Server security features

-- Grant permissions (adjust these based on your SQL Server setup)
-- GRANT ALL ON burnout_assessments TO authenticated;
-- GRANT ALL ON burnout_assessments TO service_role;

-- Add extended property for documentation (SQL Server equivalent of COMMENT)
EXEC sys.sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Stores daily burnout assessment results from the Daily Burnout Gauge',
    @level0type = N'SCHEMA',
    @level0name = N'dbo',
    @level1type = N'TABLE',
    @level1name = N'burnout_assessments';