import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Round {
  type: string;
  questions: string[];
  difficulty: string;
}

interface ExperienceCardProps {
  name: string;
  company: string;
  role: string;
  date: string;
  rounds: Round[];
  outcome: string;
}

const ExperienceCard = ({ 
  name, 
  company, 
  role, 
  date, 
  rounds, 
  outcome 
}: ExperienceCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {company} - {role}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              By {name} • {date}
            </p>
          </div>
          <Badge 
            variant={outcome === "Selected" ? "default" : "secondary"}
            className="ml-2"
          >
            {outcome}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground mb-2">Interview Rounds:</h4>
            <div className="space-y-2">
              {rounds.map((round, index) => (
                <div key={index} className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">
                      {round.type}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {round.difficulty}
                    </Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {round.questions.map((question, qIndex) => (
                      <li key={qIndex} className="list-disc list-inside">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceCard;