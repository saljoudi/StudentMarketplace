import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CouponCardProps {
  type: string;
  value: string;
  provider: string;
  expiresAt?: string;
  onClick: () => void;
}

export function CouponCard({ type, value, provider, expiresAt, onClick }: CouponCardProps) {
  // Determine background color based on provider
  const getProviderStyle = () => {
    switch (provider.toLowerCase()) {
      case 'amazon':
        return 'bg-yellow-50 border-yellow-100';
      case 'uber':
      case 'uber eats':
        return 'bg-blue-50 border-blue-100';
      case 'starbucks':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  // Determine badge color based on type
  const getBadgeStyle = () => {
    switch (provider.toLowerCase()) {
      case 'amazon':
        return 'bg-yellow-100 text-yellow-800';
      case 'uber':
      case 'uber eats':
        return 'bg-blue-100 text-blue-800';
      case 'starbucks':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const providerStyle = getProviderStyle();
  const badgeStyle = getBadgeStyle();

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className={`p-4 border-b ${providerStyle}`}>
        <div className="flex justify-between items-center">
          <Badge className={badgeStyle}>COUPON</Badge>
          <span className={`font-bold ${badgeStyle.replace('bg-', 'text-').replace('-100', '-600')}`}>
            {value}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-1">{provider}</h4>
        {expiresAt && (
          <p className="text-sm text-gray-500 mb-3">Valid until {new Date(expiresAt).toLocaleDateString()}</p>
        )}
        <Button 
          variant="outline"
          className="w-full bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
          onClick={onClick}
        >
          Use Coupon
        </Button>
      </CardContent>
    </Card>
  );
}
