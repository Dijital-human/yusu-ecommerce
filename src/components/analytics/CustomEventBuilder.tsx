/**
 * Custom Event Builder Component / Xüsusi Hadisə Builder Komponenti
 * Builds and tests custom analytics events
 * Xüsusi analytics hadisələrini yaradır və test edir
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Play, Save, Eye } from 'lucide-react';

interface ParameterDefinition {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export function CustomEventBuilder() {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<ParameterDefinition[]>([
    { key: '', type: 'string', required: false },
  ]);
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<string | null>(null);

  const addParameter = () => {
    setParameters([...parameters, { key: '', type: 'string', required: false }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, updates: Partial<ParameterDefinition>) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], ...updates };
    setParameters(newParameters);
  };

  const generatePreview = () => {
    const params: Record<string, any> = {};
    parameters.forEach(param => {
      if (param.key) {
        switch (param.type) {
          case 'number':
            params[param.key] = param.defaultValue ? Number(param.defaultValue) : 0;
            break;
          case 'boolean':
            params[param.key] = param.defaultValue === 'true';
            break;
          case 'array':
            params[param.key] = param.defaultValue ? JSON.parse(param.defaultValue) : [];
            break;
          case 'object':
            params[param.key] = param.defaultValue ? JSON.parse(param.defaultValue) : {};
            break;
          default:
            params[param.key] = param.defaultValue || '';
        }
      }
    });
    setPreviewData(params);
  };

  const handleSave = async () => {
    try {
      const params: Record<string, any> = {};
      parameters.forEach(param => {
        if (param.key) {
          params[param.key] = {
            type: param.type,
            required: param.required,
            defaultValue: param.defaultValue,
            description: param.description,
          };
        }
      });

      const response = await fetch('/api/analytics/custom-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventName,
          description,
          parameters: params,
          enabled: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult('Event created successfully!');
        // Reset form / Formu sıfırla
        setEventName('');
        setDescription('');
        setParameters([{ key: '', type: 'string', required: false }]);
        setPreviewData({});
      } else {
        setTestResult(`Error: ${data.error || 'Failed to create event'}`);
      }
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTest = async () => {
    try {
      generatePreview();
      
      // In production, this would call the track endpoint / Production-da bu track endpoint-ə çağırardı
      setTestResult('Test event would be tracked with parameters: ' + JSON.stringify(previewData, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Event Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name</label>
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g., product_review_submitted"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this event tracks..."
            className="w-full p-2 border rounded min-h-[80px]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Parameters</label>
            <Button size="sm" onClick={addParameter}>
              <Plus className="h-4 w-4 mr-1" />
              Add Parameter
            </Button>
          </div>

          {parameters.map((param, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded">
              <Input
                value={param.key}
                onChange={(e) => updateParameter(index, { key: e.target.value })}
                placeholder="Parameter key"
                className="col-span-3"
              />
              <select
                value={param.type}
                onChange={(e) => updateParameter(index, { type: e.target.value as any })}
                className="col-span-2 p-2 border rounded"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </select>
              <Input
                value={param.defaultValue || ''}
                onChange={(e) => updateParameter(index, { defaultValue: e.target.value })}
                placeholder="Default value"
                className="col-span-3"
              />
              <label className="col-span-2 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={param.required}
                  onChange={(e) => updateParameter(index, { required: e.target.checked })}
                />
                Required
              </label>
              {parameters.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeParameter(index)}
                  className="col-span-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Event
          </Button>
          <Button variant="outline" onClick={handleTest}>
            <Play className="h-4 w-4 mr-2" />
            Test Event
          </Button>
          <Button variant="outline" onClick={generatePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>

        {Object.keys(previewData).length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Preview:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
        )}

        {testResult && (
          <div className={`mt-4 p-4 rounded ${testResult.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

