-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" =
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'C');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER post_search_vector_update
    BEFORE INSERT OR UPDATE ON "Post"
                         FOR EACH ROW
                         EXECUTE FUNCTION update_post_search_vector();

-- Update existing records
UPDATE "Post" SET "searchVector" =
                      setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
                      setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'A') ||
                      setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
                      setweight(to_tsvector('english', COALESCE(body, '')), 'C');