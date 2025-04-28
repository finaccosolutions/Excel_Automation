/*
  # Add insert policy for profiles table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile
*/

CREATE POLICY "Enable insert for authenticated users only"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);