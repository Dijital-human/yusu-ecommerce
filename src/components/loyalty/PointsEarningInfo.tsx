/**
 * Points Earning Info Component / Xal Qazanma Məlumatı Komponenti
 * Display information about how to earn points / Xal qazanma yolları haqqında məlumat göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShoppingCart, Star, UserPlus, Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Program {
  name: string;
  pointsPerDollar: number;
}

export function PointsEarningInfo() {
  const [program, setProgram] = useState<Program | null>(null);
  const t = useTranslations('loyalty');

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      const response = await fetch('/api/loyalty/rewards');
      const data = await response.json();
      if (data.success && data.data && data.data.program) {
        setProgram(data.data.program);
      }
    } catch (error) {
      console.error('Error fetching program', error);
    }
  };

  const earningMethods = [
    {
      icon: ShoppingCart,
      title: t('earnByPurchase') || 'Earn by Purchase',
      description: t('earnByPurchaseDesc') || `Earn ${program?.pointsPerDollar || 1} point per dollar spent`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Star,
      title: t('earnByReview') || 'Earn by Review',
      description: t('earnByReviewDesc') || 'Earn points by writing product reviews',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: UserPlus,
      title: t('earnByReferral') || 'Earn by Referral',
      description: t('earnByReferralDesc') || 'Earn points by referring friends',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Gift,
      title: t('signupBonus') || 'Signup Bonus',
      description: t('signupBonusDesc') || 'Get bonus points when you sign up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('howToEarnPoints') || 'How to Earn Points'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earningMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div
                key={index}
                className={`${method.bgColor} rounded-lg p-4 flex items-start gap-3`}
              >
                <div className={`${method.color} p-2 rounded-full bg-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{method.title}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

