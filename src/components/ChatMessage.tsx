import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
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
        {timestamp && (
          <p className={cn(
            "text-xs mt-1",
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