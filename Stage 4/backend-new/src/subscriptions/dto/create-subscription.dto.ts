export class CreateSubscriptionDto {
  name: string;
  price: string;
  categoryId: number;
  renewalDate: string;
  billingCycle: string;
  notes?: string;
  cancelUrl?: string;
  status?: string;
}
