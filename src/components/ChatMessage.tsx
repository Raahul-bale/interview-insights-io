import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Source {
  id: string;
  company: string;
  role: string;
}

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  sources?: Source[];
}

const ChatMessage = ({ message, isUser, timestamp, sources }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
        isUser 
          ? "bg-primary text-primary-foreground ml-12" 
          : "bg-muted text-foreground mr-12"
      )}>
        <p className="whitespace-pre-wrap">{message}</p>
        
        {/* Show sources if this is an AI message and sources exist */}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-muted-foreground/20">
            <p className="text-xs text-muted-foreground mb-2">Based on experiences from:</p>
            <div className="flex flex-wrap gap-1">
              {sources.map((source, index) => (
                <Badge 
                  key={source.id} 
                  variant="secondary" 
                  className="text-xs px-2 py-1"
                >
                  {source.company} - {source.role}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {timestamp && (
          <p className={cn(
            "text-xs mt-2",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;