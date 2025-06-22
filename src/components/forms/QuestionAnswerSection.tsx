
import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

type FormData = {
  company: string;
  role: string;
  date: string;
  linkedinUrl: string;
  rounds: any[];
};

interface QuestionAnswerSectionProps {
  roundIndex: number;
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

const QuestionAnswerSection: React.FC<QuestionAnswerSectionProps> = ({
  roundIndex,
  register,
  watch,
  setValue,
}) => {
  const addQuestion = () => {
    const currentRound = watch(`rounds.${roundIndex}`);
    setValue(`rounds.${roundIndex}.questions`, [...currentRound.questions, '']);
    setValue(`rounds.${roundIndex}.answers`, [...(currentRound.answers || []), '']);
  };

  const removeQuestion = (questionIndex: number) => {
    const currentRound = watch(`rounds.${roundIndex}`);
    const newQuestions = currentRound.questions.filter((_, index) => index !== questionIndex);
    const newAnswers = (currentRound.answers || []).filter((_, index) => index !== questionIndex);
    setValue(`rounds.${roundIndex}.questions`, newQuestions);
    setValue(`rounds.${roundIndex}.answers`, newAnswers);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Questions & Answers</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuestion}
          className="mobile-touch-target"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {watch(`rounds.${roundIndex}.questions`).map((_, questionIndex) => (
        <div key={questionIndex} className="space-y-2 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Question {questionIndex + 1}
            </Label>
            {watch(`rounds.${roundIndex}.questions`).length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
                className="mobile-touch-target"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Textarea
            {...register(`rounds.${roundIndex}.questions.${questionIndex}`)}
            placeholder="Enter the interview question..."
            className="mobile-touch-target"
          />
          <Textarea
            {...register(`rounds.${roundIndex}.answers.${questionIndex}`)}
            placeholder="Your answer (optional)..."
            className="mobile-touch-target"
          />
        </div>
      ))}
    </div>
  );
};

export default QuestionAnswerSection;
