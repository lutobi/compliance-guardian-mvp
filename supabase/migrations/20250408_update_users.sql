-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'reviewer', 'viewer')) DEFAULT 'viewer',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add RLS policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT
    USING (role = 'admin');

CREATE POLICY "Admins can create users" ON users
    FOR INSERT
    WITH CHECK (role = 'admin');

CREATE POLICY "Admins can update users" ON users
    FOR UPDATE
    USING (role = 'admin');

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
