import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LocalCampaign } from '@/types/campaigns';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';

const campaignEditSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
});

type CampaignEditFormData = z.infer<typeof campaignEditSchema>;

interface CampaignEditFormProps {
  campaign: LocalCampaign;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CampaignEditForm = ({ campaign, onSuccess, onCancel }: CampaignEditFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CampaignEditFormData>({
    resolver: zodResolver(campaignEditSchema),
    defaultValues: {
      name: campaign.name,
      description: campaign.description || ''
    }
  });

  const onSubmit = async (data: CampaignEditFormData) => {
    try {
      setIsSubmitting(true);
      await campaignService.updateCampaign(campaign.localId!, {
        name: data.name,
        description: data.description
      });
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error('Failed to update campaign');
      console.error('Failed to update campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter campaign name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your campaign..." 
                  className="resize-none" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Campaign'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};