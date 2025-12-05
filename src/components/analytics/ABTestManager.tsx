/**
 * A/B Test Manager Component / A/B Test Meneceri Komponenti
 * Manages A/B tests: creation, results visualization, and management
 * A/B test-ləri idarə edir: yaratma, nəticələrin görüntülənməsi və idarəetmə
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Trash2, Play, Pause, BarChart3 } from 'lucide-react';

interface ABTestVariant {
  id?: string;
  name: string;
  trafficPercentage: number;
  isControl: boolean;
  configuration?: Record<string, any>;
}

interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  targetMetric: string;
  createdAt: string;
}

export function ABTestManager() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetMetric: 'conversion_rate',
    variants: [
      { name: 'Control', trafficPercentage: 50, isControl: true },
      { name: 'Variant A', trafficPercentage: 50, isControl: false },
    ] as ABTestVariant[],
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      // In production, fetch from API / Production-da API-dən al
      // const response = await fetch('/api/analytics/ab-tests');
      // const data = await response.json();
      setTests([]);
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      const response = await fetch('/api/analytics/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          targetMetric: 'conversion_rate',
          variants: [
            { name: 'Control', trafficPercentage: 50, isControl: true },
            { name: 'Variant A', trafficPercentage: 50, isControl: false },
          ],
        });
        fetchTests();
      }
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: `Variant ${formData.variants.length}`, trafficPercentage: 0, isControl: false },
      ],
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    // Redistribute traffic / Trafik yenidən paylaş
    const totalTraffic = newVariants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (totalTraffic < 100) {
      const remaining = 100 - totalTraffic;
      newVariants.forEach(v => {
        if (!v.isControl) {
          v.trafficPercentage += remaining / (newVariants.length - (newVariants.some(v => v.isControl) ? 1 : 0));
        }
      });
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariant = (index: number, updates: Partial<ABTestVariant>) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    setFormData({ ...formData, variants: newVariants });
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading A/B tests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">A/B Testing</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create A/B Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Homepage CTA Button"
              />
            </div>

            <div>
              <Label htmlFor="test-description">Description</Label>
              <Textarea
                id="test-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what you're testing..."
              />
            </div>

            <div>
              <Label htmlFor="target-metric">Target Metric</Label>
              <select
                id="target-metric"
                value={formData.targetMetric}
                onChange={(e) => setFormData({ ...formData, targetMetric: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="conversion_rate">Conversion Rate</option>
                <option value="click_rate">Click Rate</option>
                <option value="revenue">Revenue</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Variants</Label>
                <Button size="sm" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </div>
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2 mb-2 p-2 border rounded">
                  <Input
                    value={variant.name}
                    onChange={(e) => updateVariant(index, { name: e.target.value })}
                    placeholder="Variant name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={variant.trafficPercentage}
                    onChange={(e) => updateVariant(index, { trafficPercentage: Number(e.target.value) })}
                    placeholder="%"
                    className="w-20"
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={variant.isControl}
                      onChange={(e) => updateVariant(index, { isControl: e.target.checked })}
                    />
                    Control
                  </label>
                  {formData.variants.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateTest}>Create Test</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tests.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No A/B tests yet. Create your first test to get started.
          </CardContent>
        </Card>
      )}

      {tests.map((test) => (
        <Card key={test.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{test.name}</CardTitle>
                {test.description && (
                  <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Results
                </Button>
                {test.status === 'running' ? (
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{test.status}</span> | 
              Target Metric: <span className="font-medium">{test.targetMetric}</span> | 
              Variants: <span className="font-medium">{test.variants.length}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

