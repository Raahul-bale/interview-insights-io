-- Recreate triggers for rating updates (ensure they exist and work)
DROP TRIGGER IF EXISTS update_experience_rating_on_insert ON public.experience_ratings;
DROP TRIGGER IF EXISTS update_experience_rating_on_update ON public.experience_ratings;
DROP TRIGGER IF EXISTS update_experience_rating_on_delete ON public.experience_ratings;
DROP TRIGGER IF EXISTS update_experience_upvotes_trigger ON public.experience_upvotes;

-- Recreate the triggers
CREATE TRIGGER update_experience_rating_on_insert
  AFTER INSERT ON public.experience_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_rating();

CREATE TRIGGER update_experience_rating_on_update
  AFTER UPDATE ON public.experience_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_rating();

CREATE TRIGGER update_experience_rating_on_delete
  AFTER DELETE ON public.experience_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_experience_rating();

CREATE TRIGGER update_experience_upvotes_trigger
  AFTER INSERT OR DELETE ON public.experience_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_experience_upvotes();