import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import UpvoteButton from "./UpvoteButton";

interface SearchResult {
  id: string;
  company: string;
  role: string;
  user_name: string;
  date: string;
  rounds: any;
  full_text: string;
  average_rating: number;
  rating_count: number;
  upvote_count: number;
  created_at: string;
}

const SearchExperiences = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('interview_posts')
        .select('*')
        .or(`company.ilike.%${searchQuery.trim()}%,role.ilike.%${searchQuery.trim()}%,full_text.ilike.%${searchQuery.trim()}%`)
        .order('average_rating', { ascending: false })
        .order('rating_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching experiences:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search experiences by company, role, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results ({results.length})</h3>
          {results.map((experience) => (
            <Card 
              key={experience.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={(e) => {
                // Don't navigate if clicking on interactive elements
                if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="button"]')) {
                  return;
                }
                navigate(`/experience/${experience.id}`);
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {experience.company} - {experience.role}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      By {experience.user_name} • {new Date(experience.date).toLocaleDateString()}
                    </p>
                  </div>
                  <StarRating
                    experienceId={experience.id}
                    averageRating={experience.average_rating}
                    ratingCount={experience.rating_count}
                    onRatingUpdate={handleSearch}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(experience.rounds) && experience.rounds.map((round: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {round.type.replace('-', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {experience.full_text}
                  </p>
                  <div className="flex justify-end">
                    <UpvoteButton
                      experienceId={experience.id}
                      upvoteCount={experience.upvote_count}
                      onUpvoteUpdate={handleSearch}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && searchQuery && !isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          No experiences found for "{searchQuery}". Try different keywords.
        </div>
      )}
    </div>
  );
};

export default SearchExperiences;