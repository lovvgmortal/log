-- =====================================================
-- SUPABASE DATABASE MIGRATIONS FOR LOG PROJECT
-- =====================================================
-- Run these SQL commands in Supabase SQL Editor
-- =====================================================

-- 1. ADD NEW COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add theme preference to user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('dark', 'light'));

-- Add onboarding status
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add user preferences
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- 2. CREATE NEW TABLES
-- =====================================================

-- Activity Log Table (for timeline/analytics)
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'project_created', 'dna_extracted', 'script_generated', etc.
    entity_type VARCHAR(50), -- 'project', 'dna', 'note', etc.
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Variants Table (for A/B testing)
CREATE TABLE IF NOT EXISTS project_variants (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    variant_data JSONB NOT NULL,
    performance_metrics JSONB DEFAULT '{}'::jsonb, -- CTR, AVD, views, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared DNAs Table (for DNA marketplace/sharing)
CREATE TABLE IF NOT EXISTS shared_dnas (
    id TEXT PRIMARY KEY,
    dna_id TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    share_code TEXT UNIQUE, -- For private sharing
    downloads_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    ratings_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Calendar Table
CREATE TABLE IF NOT EXISTS content_calendar (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT,
    title VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'published', 'cancelled'
    platform VARCHAR(50), -- 'youtube', 'tiktok', 'instagram'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Comments/Feedback Table (for collaboration)
CREATE TABLE IF NOT EXISTS project_comments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    section_id TEXT, -- Optional: comment on specific section
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Analytics Table (for dashboard stats)
CREATE TABLE IF NOT EXISTS user_analytics (
    id TEXT PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_projects INTEGER DEFAULT 0,
    total_dnas INTEGER DEFAULT 0,
    total_scripts_generated INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    avg_score DECIMAL(5,2) DEFAULT 0.00,
    last_calculated TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);

CREATE INDEX IF NOT EXISTS idx_project_variants_project_id ON project_variants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_variants_user_id ON project_variants(user_id);

CREATE INDEX IF NOT EXISTS idx_shared_dnas_owner_id ON shared_dnas(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_dnas_public ON shared_dnas(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shared_dnas_share_code ON shared_dnas(share_code);

CREATE INDEX IF NOT EXISTS idx_content_calendar_user_id ON content_calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);

CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_dnas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Activity Logs Policies
CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Project Variants Policies
CREATE POLICY "Users can view their own variants"
    ON project_variants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own variants"
    ON project_variants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own variants"
    ON project_variants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own variants"
    ON project_variants FOR DELETE
    USING (auth.uid() = user_id);

-- Shared DNAs Policies
CREATE POLICY "Users can view public DNAs or their own"
    ON shared_dnas FOR SELECT
    USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can insert their own shared DNAs"
    ON shared_dnas FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own shared DNAs"
    ON shared_dnas FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shared DNAs"
    ON shared_dnas FOR DELETE
    USING (auth.uid() = owner_id);

-- Content Calendar Policies
CREATE POLICY "Users can view their own calendar"
    ON content_calendar FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar items"
    ON content_calendar FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar items"
    ON content_calendar FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar items"
    ON content_calendar FOR DELETE
    USING (auth.uid() = user_id);

-- Project Comments Policies
CREATE POLICY "Users can view comments on their projects"
    ON project_comments FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
    );

CREATE POLICY "Users can insert comments"
    ON project_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON project_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON project_comments FOR DELETE
    USING (auth.uid() = user_id);

-- User Analytics Policies
CREATE POLICY "Users can view their own analytics"
    ON user_analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
    ON user_analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
    ON user_analytics FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update user analytics
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when projects/dnas are created
    INSERT INTO user_analytics (id, user_id, total_projects, total_dnas)
    VALUES (
        'analytics-' || NEW.user_id,
        NEW.user_id,
        (SELECT COUNT(*) FROM projects WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM dnas WHERE user_id = NEW.user_id)
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_projects = (SELECT COUNT(*) FROM projects WHERE user_id = NEW.user_id),
        total_dnas = (SELECT COUNT(*) FROM dnas WHERE user_id = NEW.user_id),
        last_calculated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for analytics updates
CREATE TRIGGER trigger_update_analytics_on_project
    AFTER INSERT OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analytics();

CREATE TRIGGER trigger_update_analytics_on_dna
    AFTER INSERT OR DELETE ON dnas
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analytics();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (id, user_id, activity_type, entity_type, entity_id, metadata)
    VALUES (
        'activity-' || gen_random_uuid()::text,
        NEW.user_id,
        TG_ARGV[0], -- activity_type passed as argument
        TG_TABLE_NAME,
        NEW.id,
        jsonb_build_object('name', COALESCE(NEW.name, NEW.title, 'Untitled'))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity logging
CREATE TRIGGER trigger_log_project_created
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_activity('project_created');

CREATE TRIGGER trigger_log_dna_created
    AFTER INSERT ON dnas
    FOR EACH ROW
    EXECUTE FUNCTION log_activity('dna_created');

-- =====================================================
-- 6. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Initialize analytics for existing users
INSERT INTO user_analytics (id, user_id, total_projects, total_dnas)
SELECT 
    'analytics-' || auth.users.id,
    auth.users.id,
    COALESCE((SELECT COUNT(*) FROM projects WHERE user_id = auth.users.id), 0),
    COALESCE((SELECT COUNT(*) FROM dnas WHERE user_id = auth.users.id), 0)
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- After running this migration:
-- 1. Verify all tables are created: SELECT * FROM information_schema.tables WHERE table_schema = 'public';
-- 2. Check RLS policies: SELECT * FROM pg_policies;
-- 3. Test with a user account to ensure permissions work
-- =====================================================
