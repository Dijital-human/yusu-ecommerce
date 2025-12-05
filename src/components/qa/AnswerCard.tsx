/**
 * Answer Card Component / Cavab Kartı Komponenti
 * Display answer to question / Suala cavabı göstər
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

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

interface AnswerCardProps {
  answer: Answer;
  questionId: string;
  onVote?: () => void;
}

export function AnswerCard({ answer, onVote }: AnswerCardProps) {
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null);
  const { data: session } = useSession();
  const t = useTranslations('qa');
  const tCommon = useTranslations('common');

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (!session?.user) {
      return;
    }

    if (voting) return;

    setVoting(true);

    try {
      const response = await fetch(`/api/answers/${answer.id}/vote`, {
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
      console.error('Failed to vote on answer', error);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {answer.user.image ? (
            <Image
              src={answer.user.image}
              alt={answer.user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {answer.user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">{answer.user.name}</span>
            {answer.isSeller && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('seller') || 'Seller'}
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {new Date(answer.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="text-gray-700 mb-3">{answer.answer}</p>

          <div className="flex items-center gap-4">
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
              {answer.helpfulCount > 0 && (
                <span className="text-sm text-gray-600">{answer.helpfulCount}</span>
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
    </div>
  );
}

