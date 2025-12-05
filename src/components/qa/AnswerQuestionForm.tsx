/**
 * Answer Question Form Component / Suala Cavab Vermə Formu Komponenti
 * Form for answering questions / Suallara cavab vermək üçün forma
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';

interface AnswerQuestionFormProps {
  questionId: string;
  onSuccess?: () => void;
}

export function AnswerQuestionForm({ questionId, onSuccess }: AnswerQuestionFormProps) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('qa');
  const tCommon = useTranslations('common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError(t('answerRequired') || 'Answer is required');
      return;
    }

    if (answer.length > 2000) {
      setError(t('answerTooLong') || 'Answer is too long (max 2000 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t('failedToAnswer') || 'Failed to answer question');
      }

      setAnswer('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || t('failedToAnswer') || 'Failed to answer question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
          {t('answerQuestion')}
        </label>
        <Input
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={t('answerPlaceholder') || 'Write your answer...'}
          className="w-full"
          rows={4}
          as="textarea"
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {answer.length}/2000 {tCommon('characters') || 'characters'}
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !answer.trim()}
        className="w-full"
      >
        {loading ? (
          tCommon('submitting') || 'Submitting...'
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {t('submitAnswer')}
          </>
        )}
      </Button>
    </form>
  );
}

