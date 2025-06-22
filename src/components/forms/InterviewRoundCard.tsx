
import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import QuestionAnswerSection from './QuestionAnswerSection';
import { FormData } from './types';

interface InterviewRoundCardProps {
  roundIndex: number;
  onRemove: () => void;
  canRemove: boolean;
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
}

const InterviewRoundCard: React.FC<InterviewRoundCardProps> = ({
  roundIndex,
  onRemove,
  canRemove,
  register,
  watch,
  setValue,
  errors,
}) => {
  const roundError = errors.rounds?.[roundIndex];
  const typeError = roundError?.type;
  const experienceError = roundError?.experience;

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Round {roundIndex + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="mobile-touch-target"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Round Type *</Label>
            <Select
              onValueChange={(value) =>
                setValue(`rounds.${roundIndex}.type`, value)
              }
            >
              <SelectTrigger className="mobile-touch-target">
                <SelectValue placeholder="Select round type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                <SelectItem value="System Design">System Design</SelectItem>
                <SelectItem value="Behavioral Interview">Behavioral Interview</SelectItem>
                <SelectItem value="Coding Challenge">Coding Challenge</SelectItem>
                <SelectItem value="Case Study">Case Study</SelectItem>
                <SelectItem value="Final Interview">Final Interview</SelectItem>
                <SelectItem value="HR Interview">HR Interview</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {typeError && (
              <p className="text-sm text-red-500">
                {typeof typeError === 'object' && 'message' in typeError
                  ? typeError.message
                  : 'Round type is required'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Difficulty *</Label>
            <Select
              onValueChange={(value) =>
                setValue(`rounds.${roundIndex}.difficulty`, value as 'Easy' | 'Medium' | 'Hard')
              }
              defaultValue="Medium"
            >
              <SelectTrigger className="mobile-touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <QuestionAnswerSection
          roundIndex={roundIndex}
          register={register}
          watch={watch}
          setValue={setValue}
        />

        <div className="space-y-2">
          <Label>Overall Experience for this Round *</Label>
          <Textarea
            {...register(`rounds.${roundIndex}.experience`)}
            placeholder="Describe your overall experience for this round..."
            className="min-h-[120px] mobile-touch-target"
          />
          {experienceError && (
            <p className="text-sm text-red-500">
              {typeof experienceError === 'object' && 'message' in experienceError
                ? experienceError.message
                : 'Experience description is required'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewRoundCard;
