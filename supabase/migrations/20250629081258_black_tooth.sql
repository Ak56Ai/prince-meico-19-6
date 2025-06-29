/*
  # Admin Roles Table (Optional - for future use)

  1. New Tables
    - `admin_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text) - 'super_admin', 'admin', 'moderator'
      - `permissions` (jsonb) - specific permissions
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on admin_roles table
    - Add policies for admin management
*/

-- Create admin_roles table (for future use)
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can manage all admin roles"
  ON admin_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar 
      WHERE ar.user_id = auth.uid() 
      AND ar.role = 'super_admin' 
      AND ar.is_active = true
    )
  );

CREATE POLICY "Admins can view admin roles"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar 
      WHERE ar.user_id = auth.uid() 
      AND ar.is_active = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON admin_roles(is_active);

-- Insert the current admin as super admin
INSERT INTO admin_roles (user_id, role, permissions, created_by, is_active) 
VALUES (
  'c4506c4a-ed56-43a2-8a74-da42c0131b7c',
  'super_admin',
  '{"manage_users": true, "manage_purchases": true, "manage_projects": true, "manage_admins": true}',
  'c4506c4a-ed56-43a2-8a74-da42c0131b7c',
  true
) ON CONFLICT (user_id) DO NOTHING;