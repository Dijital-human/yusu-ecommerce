/**
 * Ask Question Form Component / Sual Vermə Formu Komponenti
 * Form for asking questions about products / Məhsullar haqqında sual vermək üçün forma
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';

interface AskQuestionFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function AskQuestionForm({ productId, onSuccess }: AskQuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('qa');
  const tCommon = useTranslations('common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError(t('questionRequired') || 'Question is required');
      return;
    }

    if (question.length > 1000) {
      setError(t('questionTooLong') || 'Question is too long (max 1000 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t('failedToAskQuestion') || 'Failed to ask question');
      }

      setQuestion('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || t('failedToAskQuestion') || 'Failed to ask question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
          {t('askQuestion')}
        </label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder') || 'Ask a question about this product...'}
          className="w-full"
          rows={4}
          as="textarea"
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {question.length}/1000 {tCommon('characters') || 'characters'}
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !question.trim()}
        className="w-full"
      >
        {loading ? (
          tCommon('submitting') || 'Submitting...'
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {t('submitQuestion')}
          </>
        )}
      </Button>
    </form>
  );
}

