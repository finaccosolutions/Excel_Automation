/*
  # Add trigger for automatic profile creation

  1. New Functions
    - `handle_new_user`: Creates a profile entry when a new user signs up
  
  2. New Triggers
    - Trigger on auth.users to automatically create profile entries
*/

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create a trigger to call this function after user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();