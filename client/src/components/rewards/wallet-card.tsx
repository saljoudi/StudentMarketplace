import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface RewardHistoryItem {
  id: number;
  type: string;
  amount: number;
  description: string;
  surveyTitle?: string;
  createdAt: string;
}

interface WalletCardProps {
  cashBalance: number;
  rewardHistory: RewardHistoryItem[];
}

export function WalletCard({ cashBalance, rewardHistory }: WalletCardProps) {
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    amount: z.coerce
      .number()
      .min(1, "Amount must be at least $1")
      .max(cashBalance / 100, `Amount cannot exceed your balance of $${(cashBalance / 100).toFixed(2)}`),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: Math.min(Math.floor(cashBalance / 100), 10), // Default to $10 or max balance
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      // Convert dollars to cents for the API
      const amountInCents = Math.round(data.amount * 100);
      const res = await apiRequest("POST", "/api/partner/payouts", { amount: amountInCents });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/rewards"] });
      setIsPayoutDialogOpen(false);
      toast({
        title: "Payout requested",
        description: "Your payout request has been submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Payout request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitPayout = (values: z.infer<typeof formSchema>) => {
    payoutMutation.mutate(values);
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="p-6 bg-gradient-to-r from-primary to-purple-500 text-white">
          <h3 className="text-lg font-semibold mb-1">Your Balance</h3>
          <p className="text-3xl font-bold mb-1">${(cashBalance / 100).toFixed(2)}</p>
          <p className="text-sm opacity-80">Available for payout</p>
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-gray-700">Reward History</span>
            {/* <a href="#" className="text-sm text-primary hover:text-primary/90">View all</a> */}
          </div>
          <div className="space-y-3">
            {rewardHistory.slice(0, 5).map((reward) => (
              <div key={reward.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{reward.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(reward.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <span className="font-medium text-green-600">
                  +${(reward.amount / 100).toFixed(2)}
                </span>
              </div>
            ))}

            {rewardHistory.length === 0 && (
              <div className="py-4 text-center text-gray-500">
                No reward history yet. Complete surveys to earn rewards!
              </div>
            )}
          </div>

          <Button 
            className="w-full mt-6" 
            onClick={() => setIsPayoutDialogOpen(true)}
            disabled={cashBalance <= 0}
          >
            Request Payout
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to withdraw from your reward balance.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPayout)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="1" 
                        max={(cashBalance / 100).toFixed(2)} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPayoutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={payoutMutation.isPending}
                >
                  {payoutMutation.isPending ? "Processing..." : "Request Payout"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
