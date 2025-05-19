import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Question } from "@shared/schema";

interface SurveyFormProps {
  surveyId: number;
  surveyTitle: string;
  surveyDescription: string;
  questions: Question[];
  onSubmit: (answers: { questionId: number; value: string }[]) => void;
}

export function SurveyForm({
  surveyId,
  surveyTitle,
  surveyDescription,
  questions,
  onSubmit,
}: SurveyFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; value: string }[]>([]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Create dynamic schema based on question type
  const getQuestionSchema = () => {
    const baseSchema = z.object({
      value: z.string().min(1, "Please provide an answer"),
    });
    
    if (currentQuestion.type === 'text') {
      return baseSchema;
    } else if (currentQuestion.type === 'multiple_choice') {
      return baseSchema;
    } else if (currentQuestion.type === 'rating') {
      return baseSchema;
    }
    
    return baseSchema;
  };
  
  const form = useForm<{ value: string }>({
    resolver: zodResolver(getQuestionSchema()),
    defaultValues: {
      value: answers.find(a => a.questionId === currentQuestion.id)?.value || "",
    },
  });
  
  const handleNext = (data: { value: string }) => {
    // Store the answer
    const newAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id)];
    newAnswers.push({
      questionId: currentQuestion.id,
      value: data.value,
    });
    setAnswers(newAnswers);
    
    if (isLastQuestion) {
      // Submit all answers
      onSubmit(newAnswers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Reset form with existing answer for next question if available
      const nextQuestionId = questions[currentQuestionIndex + 1].id;
      const existingAnswer = newAnswers.find(a => a.questionId === nextQuestionId)?.value || "";
      form.reset({ value: existingAnswer });
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Set form value to previous answer if available
      const prevQuestionId = questions[currentQuestionIndex - 1].id;
      const existingAnswer = answers.find(a => a.questionId === prevQuestionId)?.value || "";
      form.reset({ value: existingAnswer });
    }
  };
  
  const renderQuestionInput = () => {
    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options) {
      const options = Array.isArray(currentQuestion.options) ? currentQuestion.options : [];
      
      return (
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-3"
                >
                  {options.map((option, index) => (
                    <FormItem
                      key={index}
                      className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <FormControl>
                        <RadioGroupItem value={option} className="h-5 w-5" />
                      </FormControl>
                      <FormLabel className="ml-3 font-medium text-gray-700 cursor-pointer">
                        {option}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    
    if (currentQuestion.type === 'text') {
      return (
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Enter your answer here..."
                  className="resize-none h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    
    if (currentQuestion.type === 'rating') {
      return (
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex justify-center space-x-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={field.value === rating.toString() ? "default" : "outline"}
                      className="h-12 w-12 text-lg"
                      onClick={() => field.onChange(rating.toString())}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    
    return (
      <FormField
        control={form.control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="Enter your answer here..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{surveyTitle}</h1>
        <p className="mt-2 text-lg text-gray-600">{surveyDescription}</p>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="bg-primary-100 text-primary-600 rounded-full h-12 w-12 flex items-center justify-center font-semibold text-xl">
                {currentQuestionIndex + 1}
              </div>
              <span className="ml-3 text-gray-600">of {questions.length} questions</span>
            </div>
            <div className="w-44">
              <Progress value={progress} className="h-3" />
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion.text}</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
                {renderQuestionInput()}
                
                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button type="submit">
                    {isLastQuestion ? "Submit" : "Next"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>Privacy protected. Your responses are anonymous and will be used for research purposes only.</p>
      </div>
    </div>
  );
}
