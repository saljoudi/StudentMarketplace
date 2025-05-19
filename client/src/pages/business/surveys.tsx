import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/dashboard/mobile-nav";
import { SurveyList } from "@/components/surveys/survey-list";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for creating a new survey
const surveySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  estimatedTime: z.coerce.number().min(1, "Time must be at least 1 minute"),
  reward: z.coerce.number().min(0, "Reward must be 0 or greater"),
  maxResponses: z.coerce.number().min(1, "Must have at least 1 max response"),
  expiresAt: z.string().optional(),
  questions: z.array(
    z.object({
      text: z.string().min(1, "Question text is required"),
      type: z.enum(["multiple_choice", "text", "rating"]),
      options: z.array(z.string()).optional(),
      isRequired: z.boolean().default(true),
    })
  ).min(1, "At least one question is required"),
});

type SurveyFormData = z.infer<typeof surveySchema>;

export default function BusinessSurveys() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch business surveys
  const { data: surveys, isLoading } = useQuery({
    queryKey: ["/api/business/surveys"],
  });

  // Create survey mutation
  const createSurveyMutation = useMutation({
    mutationFn: async (data: SurveyFormData) => {
      // Convert reward from dollars to cents
      const formData = {
        ...data,
        reward: data.reward * 100,
      };
      
      const res = await apiRequest("POST", "/api/business/surveys", formData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/surveys"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Survey created",
        description: "Your survey has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create survey",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedTime: 5,
      reward: 5,
      maxResponses: 50,
      expiresAt: "",
      questions: [
        {
          text: "",
          type: "multiple_choice",
          options: ["", ""],
          isRequired: true,
        },
      ],
    },
  });

  const onSubmit = (data: SurveyFormData) => {
    createSurveyMutation.mutate(data);
  };

  const handleCreateSurvey = () => {
    setIsCreateDialogOpen(true);
    setQuestionCount(1);
    form.reset();
  };

  const addQuestion = () => {
    const questions = form.getValues("questions") || [];
    form.setValue("questions", [
      ...questions,
      {
        text: "",
        type: "multiple_choice",
        options: ["", ""],
        isRequired: true,
      },
    ]);
    setQuestionCount(questionCount + 1);
  };

  const removeQuestion = (index: number) => {
    const questions = form.getValues("questions");
    if (questions.length > 1) {
      form.setValue(
        "questions",
        questions.filter((_, i) => i !== index)
      );
      setQuestionCount(questionCount - 1);
    }
  };

  const addOption = (questionIndex: number) => {
    const questions = form.getValues("questions");
    const questionOptions = questions[questionIndex].options || [];
    questions[questionIndex].options = [...questionOptions, ""];
    form.setValue("questions", questions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const questions = form.getValues("questions");
    const questionOptions = questions[questionIndex].options || [];
    if (questionOptions.length > 2) {
      questions[questionIndex].options = questionOptions.filter((_, i) => i !== optionIndex);
      form.setValue("questions", questions);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 lg:pl-64 pb-16 lg:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Surveys</h1>
            <p className="text-gray-600">Create and manage your survey campaigns</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SurveyList surveys={surveys || []} onCreateSurvey={handleCreateSurvey} />
          )}
        </div>
      </main>
      
      <MobileBottomNav />

      {/* Create Survey Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Survey</DialogTitle>
            <DialogDescription>
              Design your survey with questions and set reward amounts for participants
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survey Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Consumer Habits Survey" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the purpose of your survey" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>Dollar amount per completion</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxResponses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Responses</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Survey Questions</h3>
                  <Button type="button" variant="outline" onClick={addQuestion}>
                    Add Question
                  </Button>
                </div>

                {Array.from({ length: questionCount }).map((_, index) => (
                  <div key={index} className="mb-6 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      {questionCount > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your question here" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name={`questions.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a question type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="rating">Rating</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`questions.${index}.isRequired`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between mt-8">
                            <FormLabel>Required Question</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch(`questions.${index}.type`) === "multiple_choice" && (
                      <div className="mt-4">
                        <FormLabel>Options</FormLabel>
                        <div className="space-y-2">
                          {(form.watch(`questions.${index}.options`) || []).map(
                            (_, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <FormField
                                  control={form.control}
                                  name={`questions.${index}.options.${optionIndex}`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          placeholder={`Option ${optionIndex + 1}`}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                {(form.watch(`questions.${index}.options`) || []).length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index, optionIndex)}
                                    className="text-red-500"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            )
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(index)}
                          >
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSurveyMutation.isPending}
                >
                  {createSurveyMutation.isPending ? "Creating..." : "Create Survey"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
