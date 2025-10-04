'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  brandUrl: z.string().url('Please enter a valid URL'),
  description: z.string().min(50, 'Description should be at least 50 characters long'),
  keywords: z.array(z.string()).min(3, 'Please add at least 3 keywords'),
});

type FormData = z.infer<typeof formSchema>;

export function BrandForm() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [savedBrands, setSavedBrands] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    brandUrl: '',
    description: '',
    keywords: [],
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/brands');
      const data = await response.json();
      if (data.brands) {
        setSavedBrands(data.brands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Failed to fetch brands');
    } finally {
      setIsFetching(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    setError(null);
    try {
      if (step === 1) {
        formSchema.shape.brandUrl.parse(formData.brandUrl);
      } else if (step === 2) {
        formSchema.shape.description.parse(formData.description);
      } else if (step === 3) {
        formSchema.shape.keywords.parse(formData.keywords);
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep() && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError(null);
      setStep(step - 1);
    }
  };

  const [currentKeyword, setCurrentKeyword] = useState('');

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentKeyword(value);
    
    // If user types or pastes text with commas
    if (value.includes(',')) {
      const newKeywords = value
        .split(',')
        .map(k => k.trim())
        .filter(k => k !== '' && !formData.keywords.includes(k));
      
      if (newKeywords.length > 0) {
        setFormData({
          ...formData,
          keywords: [...formData.keywords, ...newKeywords]
        });
        setCurrentKeyword('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Comma' || e.key === ',') {
      e.preventDefault();
      if (currentKeyword.trim() !== '' && !formData.keywords.includes(currentKeyword.trim())) {
        setFormData({
          ...formData,
          keywords: [...formData.keywords, currentKeyword.trim()]
        });
        setCurrentKeyword('');
      }
    } else if (e.key === 'Enter' && currentKeyword.trim()) {
      e.preventDefault();
      if (!formData.keywords.includes(currentKeyword.trim())) {
        setFormData({
          ...formData,
          keywords: [...formData.keywords, currentKeyword.trim()]
        });
        setCurrentKeyword('');
      }
    } else if (e.key === 'Backspace' && currentKeyword === '' && formData.keywords.length > 0) {
      // Remove the last keyword when backspace is pressed and input is empty
      const newKeywords = [...formData.keywords];
      newKeywords.pop();
      setFormData({ ...formData, keywords: newKeywords });
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keywordToRemove)
    });
  };

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      try {
        setLoading(true);
        const response = await fetch('/api/brands', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: formData.brandUrl,
            description: formData.description,
            keywords: formData.keywords,
            userName: user?.fullName,
            userEmail: user?.emailAddresses[0]?.emailAddress,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save brand');
        }

        // Reset form and fetch updated brands
        setFormData({ brandUrl: '', description: '', keywords: [] });
        setStep(1);
        await fetchBrands();
      } catch (err) {
        setError('Failed to save brand data');
      } finally {
        setLoading(false);
      }
    }
  };

  if (isFetching) {
    return (
      <div className="w-full p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-2">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Don't show form if user already has a brand
  if (savedBrands.length > 0) {
    return (
      <div className="w-full p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Existing brand cards */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className='bg-gray-50 text-black'>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this brand and all of its data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className='bg-white border-gray-200 hover:bg-gray-100 hover:text-black'>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    if (!brandToDelete) return;
                    setIsDeleting(true);
                    try {
                      const response = await fetch(`/api/brands?id=${brandToDelete._id}`, {
                        method: 'DELETE',
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to delete brand');
                      }
                      
                      // Update the UI by removing the deleted brand
                      setSavedBrands(current => current.filter(b => b._id !== brandToDelete._id));
                      toast.success('Brand deleted successfully');
                    } catch (error) {
                      console.error('Error deleting brand:', error);
                      toast.error('Failed to delete brand');
                    } finally {
                      setIsDeleting(false);
                      setBrandToDelete(null);
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {savedBrands.map((brand: any) => (
            <Card key={brand._id} className="shadow-sm border-0 bg-white relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault();
                    setBrandToDelete(brand);
                    setIsDeleteDialogOpen(true);
                  }}
                  disabled={isDeleting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">
                      {new URL(brand.url).hostname.replace('www.', '')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {brand.url}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {brand.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {brand.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add more brands card */}
          <Card className="shadow-sm border-2 border-dashed border-gray-200 bg-white/50 hover:bg-white/80 transition-colors cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-gray-600">Add More Brands</p>
                  <p className="text-xs text-muted-foreground">Upgrade to Professional</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-primary text-primary hover:bg-green-800 hover:text-white text-white bg-green-700"
                  onClick={() => setIsUpgradeDialogOpen(true)}
                >
                  Upgrade Now
                </Button>

                <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                  <DialogContent className="sm:max-w-[425px] bg-white text-black">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        Upgrade
                      </DialogTitle>
                      <DialogDescription className="pt-2 space-y-3 text-gray-700">
                        <p>
                          Get access to premium features and unlock the full potential of Searches:
                        </p>
                        <ul className="list-disc pl-4 space-y-2 text-gray-500">
                          <li>unlimited brands</li>
                          <li>Advanced marketing tools</li>
                          <li>Priority customer support</li>
                        </ul>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-between">
                      <DialogDescription className="text-sm text-muted-foreground">
                        Coming soon! Stay tuned for updates.
                      </DialogDescription>
                      <Button variant="default" onClick={() => setIsUpgradeDialogOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show form only if user hasn't submitted a brand yet
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-2 border-gray-100 bg-white">
        <CardHeader className="text-center pb-6 bg-gray-50">
          <CardTitle className="text-2xl font-bold text-primary">
            {step === 1 && "Enter Your Brand URL"}
            {step === 2 && "Describe Your Brand"}
            {step === 3 && "Add Brand Keywords"}
          </CardTitle>
        </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <div className="relative">
              <Input
                placeholder="https://yourbrand.com"
                value={formData.brandUrl}
                className="h-14 px-4 text-lg border-2 text-black bg-white border-gray-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-300"
                onChange={(e) => {
                  setError(null);
                  setFormData({ ...formData, brandUrl: e.target.value });
                }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Enter the URL of the brand or website you want to promote
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Textarea
              placeholder="Tell us about your brand..."
              className="min-h-[200px] p-4 text-lg border-2 text-black bg-white border-gray-200 resize-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-300"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-sm text-gray-500 text-center">
              Provide a detailed description of your brand, its values, and what makes it unique
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Type a keyword and press Enter or comma"
                value={currentKeyword}
                className="h-14 px-4 text-lg border-2 text-black bg-white border-gray-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-300"
                onChange={handleKeywordsChange}
                onKeyDown={handleKeyDown}
              />
              <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                {formData.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    className="px-3 py-2 text-base bg-white flex items-center gap-2"
                    variant="secondary"
                  >
                    {keyword}
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
                {formData.keywords.length === 0 && (
                  <p className="text-gray-400 text-sm p-2">Type a keyword and press Enter or comma to add it here</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Add keywords that best describe your brand (separate with commas)
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-gray-50 border-gray-200 border-t">
        {step > 1 && (
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={loading}
            className="px-8 text-black bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:!text-black transition-colors"
          >
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button 
            onClick={handleNext}
            disabled={loading} 
            className={`px-8 ${step === 1 ? 'ml-auto' : ''}`}
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 text-black bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:!text-black transition-colors"
          >
            {loading ? 'Saving...' : 'Submit'}
          </Button>
        )}
      </CardFooter>
    </Card>
    </div>
  );
}