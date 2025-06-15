import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useAppFeedback } from "@/hooks/useAppFeedback";
import { useRealTimeStats } from "@/hooks/useRealTimeStats";

const AboutUs = () => {
  const { topFeedback, averageRating, loading: feedbackLoading } = useAppFeedback();
  const { stats, loading: statsLoading } = useRealTimeStats();

  return (
    <div className="bg-muted/30 py-16 mt-20">
      <div className="container mx-auto px-4">
        {/* Top User Feedback Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-6 w-6 ${
                      star <= Math.round(Number(averageRating)) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-foreground ml-2">
                {!feedbackLoading ? Number(averageRating).toFixed(1) : '-.'}
              </span>
              <span className="text-muted-foreground ml-1">/ 5.0</span>
            </div>
          </div>

          {/* Top 5 Feedback Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {!feedbackLoading && topFeedback.slice(0, 5).map((feedback, index) => (
              <Card key={feedback.id} className="relative">
                {index === 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900">
                    Top Rated
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{feedback.user_name}</CardTitle>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${
                            star <= feedback.rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    "{feedback.feedback}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {feedbackLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-4/5"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* About Us Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground mb-4">About Interview Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Interview Insights is dedicated to democratizing interview preparation by providing 
                    a platform where professionals can share real interview experiences, helping others 
                    succeed in their career journeys.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">What We Offer</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Real interview experiences from top companies</li>
                    <li>• AI-powered interview preparation chat</li>
                    <li>• Community-driven insights and tips</li>
                    <li>• Comprehensive company and role filters</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {!statsLoading ? stats.experiences : '...'}
                  </div>
                  <div className="text-sm text-muted-foreground">Experiences</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {!statsLoading ? stats.companies : '...'}
                  </div>
                  <div className="text-sm text-muted-foreground">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {!statsLoading ? stats.users : '...'}
                  </div>
                  <div className="text-sm text-muted-foreground">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {!statsLoading ? stats.successRate : '...'}
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>

              <div className="text-center pt-6 border-t">
                <p className="text-muted-foreground">
                  Have questions or suggestions? 
                  <a 
                    href="mailto:baleraahul@gmail.com?subject=Query from Interview Experience App" 
                    className="text-primary font-medium hover:underline ml-1"
                  >
                    Contact us
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;