/**
 * Question Card Component / Sual Kartı Komponenti
 * Display question and answers / Sualı və cavabları göstər
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { AnswerCard } from './AnswerCard';
import { AnswerQuestionForm } from './AnswerQuestionForm';

interface Answer {
  id: string;
  answer: string;
  isSeller: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Question {
  id: string;
  question: string;
  status: string;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  answers: Answer[];
}

interface QuestionCardProps {
  question: Question;
  onVote?: () => void;
  onAnswer?: () => void;
}

export function QuestionCard({ question, onVote, onAnswer }: QuestionCardProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null);
  const { data: session } = useSession();
  const t = useTranslations('qa');
  const tCommon = useTranslations('common');

  const isSeller = session?.user && (
    session.user.role === 'SELLER' ||
    session.user.role === 'SUPER_SELLER' ||
    session.user.role === 'USER_SELLER'
  );

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (!session?.user) {
      return;
    }

    if (voting) return;

    setVoting(true);

    try {
      const response = await fetch(`/api/questions/${question.id}/vote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserVote(voteType);
        if (onVote) {
          onVote();
        }
      }
    } catch (error) {
      console.error('Failed to vote on question', error);
    } finally {
      setVoting(false);
    }
  };

  const handleAnswerSuccess = () => {
    setShowAnswerForm(false);
    if (onAnswer) {
      onAnswer();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {question.user.image ? (
            <Image
              src={question.user.image}
              alt={question.user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {question.user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">{question.user.name}</span>
            <Badge
              className={
                question.status === 'answered'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {question.status === 'answered'
                ? t('answered') || 'Answered'
                : t('pending') || 'Pending'}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="text-gray-900 font-medium mb-3">{question.question}</p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('helpful')}
                disabled={voting || !session?.user}
                className={`${userVote === 'helpful' ? 'text-blue-600' : ''}`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {t('helpful') || 'Helpful'}
              </Button>
              {question.helpfulCount > 0 && (
                <span className="text-sm text-gray-600">{question.helpfulCount}</span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('not_helpful')}
              disabled={voting || !session?.user}
              className={`${userVote === 'not_helpful' ? 'text-red-600' : ''}`}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              {t('notHelpful') || 'Not Helpful'}
            </Button>
          </div>
        </div>
      </div>

      {/* Answers / Cavablar */}
      {question.answers.length > 0 && (
        <div className="ml-13 space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('answers')} ({question.answers.length})
          </h4>
          {question.answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              questionId={question.id}
              onVote={onVote}
            />
          ))}
        </div>
      )}

      {/* Answer Form / Cavab Formu */}
      {isSeller && !showAnswerForm && (
        <div className="ml-13">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswerForm(true)}
          >
            {t('answerQuestion')}
          </Button>
        </div>
      )}

      {showAnswerForm && (
        <div className="ml-13">
          <AnswerQuestionForm
            questionId={question.id}
            onSuccess={handleAnswerSuccess}
          />
        </div>
      )}
    </div>
  );
}

