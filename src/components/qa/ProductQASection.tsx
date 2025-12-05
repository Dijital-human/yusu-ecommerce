/**
 * Product Q&A Section Component / Məhsul Sual-Cavab Bölməsi Komponenti
 * Main Q&A section for product detail page / Məhsul detalları səhifəsi üçün əsas Sual-Cavab bölməsi
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { MessageCircle, Plus } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { AskQuestionForm } from './AskQuestionForm';
import { QuestionSorting } from './QuestionSorting';

interface ProductQASectionProps {
  productId: string;
}

export function ProductQASection({ productId }: ProductQASectionProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_helpful'>('newest');
  const [status, setStatus] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations('qa');
  const tCommon = useTranslations('common');

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/products/${productId}/questions?page=${page}&limit=10&sortBy=${sortBy}&status=${status}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        if (page === 1) {
          setQuestions(data.data.questions);
        } else {
          setQuestions((prev) => [...prev, ...data.data.questions]);
        }
        setHasMore(data.data.pagination.page < data.data.pagination.totalPages);
      } else {
        throw new Error(data.error || t('failedToLoadQuestions') || 'Failed to load questions');
      }
    } catch (err: any) {
      setError(err.message || t('failedToLoadQuestions') || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [productId, sortBy, status, page]);

  const handleQuestionSuccess = () => {
    setShowAskForm(false);
    setPage(1);
    fetchQuestions();
  };

  const handleVote = () => {
    fetchQuestions();
  };

  const handleAnswer = () => {
    fetchQuestions();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t('title') || 'Questions & Answers'}
          </CardTitle>
          {session?.user && !showAskForm && (
            <Button onClick={() => setShowAskForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('askQuestion')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Ask Question Form / Sual Vermə Formu */}
        {showAskForm && (
          <div className="mb-6">
            <AskQuestionForm productId={productId} onSuccess={handleQuestionSuccess} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAskForm(false)}
              className="mt-2"
            >
              {tCommon('cancel') || 'Cancel'}
            </Button>
          </div>
        )}

        {/* Sorting and Filtering / Sıralama və Filtrləmə */}
        {questions.length > 0 && (
          <QuestionSorting
            sortBy={sortBy}
            status={status}
            onSortChange={setSortBy}
            onStatusChange={setStatus}
          />
        )}

        {/* Questions List / Suallar Siyahısı */}
        {loading && page === 1 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {t('noQuestions') || 'No questions yet. Be the first to ask!'}
            </p>
            {session?.user && !showAskForm && (
              <Button onClick={() => setShowAskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('askFirstQuestion') || 'Ask First Question'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onVote={handleVote}
                onAnswer={handleAnswer}
              />
            ))}

            {/* Load More / Daha Çox Yüklə */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading}
                >
                  {loading ? tCommon('loading') || 'Loading...' : t('loadMore') || 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

