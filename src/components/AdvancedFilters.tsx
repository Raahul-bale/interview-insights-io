import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface FilterOptions {
  company?: string;
  role?: string;
  difficulty?: string;
  minRating?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const AdvancedFilters = ({ onFiltersChange, className }: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [companies, setCompanies] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  // Fetch unique companies and roles for dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Get unique companies
        const { data: companyData } = await supabase
          .from('interview_posts')
          .select('company')
          .neq('company', '')
          .order('company');
        
        // Get unique roles
        const { data: roleData } = await supabase
          .from('interview_posts')
          .select('role')
          .neq('role', '')
          .order('role');

        if (companyData) {
          const uniqueCompanies = [...new Set(companyData.map(item => item.company))];
          setCompanies(uniqueCompanies);
        }

        if (roleData) {
          const uniqueRoles = [...new Set(roleData.map(item => item.role))];
          setRoles(uniqueRoles);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Company Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Select 
                value={filters.company || ""} 
                onValueChange={(value) => handleFilterChange('company', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role/Title</label>
              <Select 
                value={filters.role || ""} 
                onValueChange={(value) => handleFilterChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select 
                value={filters.difficulty || ""} 
                onValueChange={(value) => handleFilterChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Rating</label>
              <Select 
                value={filters.minRating?.toString() || ""} 
                onValueChange={(value) => handleFilterChange('minRating', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center gap-1">
                        {rating}+ <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => handleFilterChange('dateFrom', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleFilterChange('dateTo', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Filters:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.company && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Company: {filters.company}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('company')}
                    />
                  </Badge>
                )}
                {filters.role && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Role: {filters.role}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('role')}
                    />
                  </Badge>
                )}
                {filters.difficulty && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Difficulty: {filters.difficulty}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('difficulty')}
                    />
                  </Badge>
                )}
                {filters.minRating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.minRating}+ Stars
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('minRating')}
                    />
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    From: {format(filters.dateFrom, "MMM dd, yyyy")}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('dateFrom')}
                    />
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    To: {format(filters.dateTo, "MMM dd, yyyy")}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => clearFilter('dateTo')}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilters;