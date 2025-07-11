import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import UpvoteButton from "./UpvoteButton";
import type { FilterOptions } from "./AdvancedFilters";

interface Experience {
  id: string;
  company: string;
  role: string;
  user_name: string;
  date: string;
  rounds: any;
  average_rating: number;
  rating_count: number;
  upvote_count: number;
  created_at: string;
}

interface FilteredExperiencesProps {
  filters: FilterOptions;
  sortBy?: 'rating' | 'recent' | 'upvotes';
  limit?: number;
}

const FilteredExperiences = ({ filters, sortBy = 'recent', limit }: FilteredExperiencesProps) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFilteredExperiences = async () => {
    try {
      setIsLoading(true);
      console.log('Applied filters:', filters);
      
      let query = supabase.from('interview_posts').select('*');

      // Apply filters
      if (filters.company) {
        query = query.eq('company', filters.company);
        console.log('Filtering by company:', filters.company);
      }
      
      if (filters.role) {
        query = query.eq('role', filters.role);
        console.log('Filtering by role:', filters.role);
      }

      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('average_rating', filters.minRating);
        console.log('Filtering by minimum rating:', filters.minRating);
      }

      if (filters.dateFrom) {
        const fromDate = filters.dateFrom.toISOString().split('T')[0];
        query = query.gte('date', fromDate);
        console.log('Filtering from date:', fromDate);
      }

      if (filters.dateTo) {
        const toDate = filters.dateTo.toISOString().split('T')[0];
        query = query.lte('date', toDate);
        console.log('Filtering to date:', toDate);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('average_rating', { ascending: false })
                      .order('rating_count', { ascending: false });
          break;
        case 'upvotes':
          query = query.order('upvote_count', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      console.log('Query result:', data);

      // Client-side filtering for difficulty (since it's not stored in DB)
      let filteredData = data || [];
      
      if (filters.difficulty) {
        // Since difficulty is not stored in the database, we'll skip this filter
        // In a real implementation, you might want to add a difficulty column to the database
        console.log('Difficulty filter applied (client-side filtering not implemented)');
      }
      
      console.log('Final filtered data:', filteredData);
      setExperiences(filteredData);
    } catch (error) {
      console.error('Error fetching filtered experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredExperiences();
  }, [filters, sortBy, limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No experiences found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtered Results</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map((experience) => (
          <Card 
            key={experience.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
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
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {experience.company} - {experience.role}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    By {experience.user_name} • {new Date(experience.date).toLocaleDateString()}
                  </p>
                </div>
                <StarRating
                  experienceId={experience.id}
                  averageRating={experience.average_rating}
                  ratingCount={experience.rating_count}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(experience.rounds) && experience.rounds.map((round: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {round.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Shared {new Date(experience.created_at).toLocaleDateString()}
                  </div>
                  <UpvoteButton
                    experienceId={experience.id}
                    upvoteCount={experience.upvote_count}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FilteredExperiences;