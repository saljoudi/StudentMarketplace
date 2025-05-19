import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/dashboard/mobile-nav";
import { WalletCard } from "@/components/rewards/wallet-card";
import { CouponCard } from "@/components/rewards/coupon-card";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PartnerRewards() {
  const { toast } = useToast();

  // Fetch partner wallet
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["/api/partner/wallet"],
  });

  // Fetch reward history
  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ["/api/partner/rewards"],
  });

  const isLoading = isLoadingWallet || isLoadingRewards;

  // Extract coupons from rewards
  const coupons = rewards?.filter((reward) => reward.type === 'coupon') || [];

  const handleUseCoupon = (couponId: number) => {
    toast({
      title: "Coupon activated",
      description: "This coupon has been copied to your clipboard and is ready to use"
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 lg:pl-64 pb-16 lg:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Rewards Wallet</h1>
            <p className="text-gray-600">Manage your earnings and redeem rewards</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Wallet Card */}
              <WalletCard 
                cashBalance={wallet?.cashBalance || 0}
                rewardHistory={rewards || []}
              />

              {/* Coupons Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Coupons</h2>
                
                {coupons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                      <CouponCard
                        key={coupon.id}
                        type={coupon.type}
                        value={`$${(coupon.amount / 100).toFixed(2)} OFF`}
                        provider={coupon.description || "Reward Coupon"}
                        expiresAt={coupon.expiresAt}
                        onClick={() => handleUseCoupon(coupon.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons available</h3>
                      <p className="text-gray-500">Complete more surveys to earn coupon rewards</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Rewards Program Information */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About Our Rewards Program</h3>
                  <p className="text-gray-600 mb-4">
                    Earn cash and coupon rewards for every survey you complete. Cash rewards can be requested for payout once you've accumulated at least $10.00.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Minimum Payout:</span>
                      <span className="font-medium">$10.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Processing Time:</span>
                      <span className="font-medium">3-5 business days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payout Methods:</span>
                      <span className="font-medium">Bank Transfer, PayPal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
}
