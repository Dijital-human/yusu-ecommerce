/**
 * Affiliate Dashboard Component / Affiliate Dashboard Komponenti
 * Main affiliate dashboard / Əsas affiliate dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AffiliateStats } from './AffiliateStats';
import { AffiliateLinkGenerator, AffiliateLinkCard } from './AffiliateLinkGenerator';
import { AffiliateCommissionHistory } from './AffiliateCommissionHistory';
import { useTranslations } from 'next-intl';
import { Link2, DollarSign, BarChart3 } from 'lucide-react';

interface AffiliateLink {
  id: string;
  linkCode: string;
  productId?: string;
  clicks: number;
  conversions: number;
  product?: {
    id: string;
    name: string;
  };
}

export function AffiliateDashboard() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const t = useTranslations('affiliate');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/affiliate/links?limit=10');
      const data = await response.json();
      if (data.success && data.data) {
        setLinks(data.data.links);
      }
    } catch (error) {
      console.error('Error fetching links', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCreated = () => {
    fetchLinks();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard') || 'Affiliate Dashboard'}
        </h1>
        <p className="text-gray-600">
          {t('dashboardDescription') || 'Manage your affiliate links and track your earnings'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Tab Navigation / Tab Naviqasiyası */}
        <div className="flex gap-2 border-b border-gray-200">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="rounded-b-none"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('overview') || 'Overview'}
          </Button>
          <Button
            variant={activeTab === 'links' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('links')}
            className="rounded-b-none"
          >
            <Link2 className="h-4 w-4 mr-2" />
            {t('links') || 'Links'}
          </Button>
          <Button
            variant={activeTab === 'commissions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('commissions')}
            className="rounded-b-none"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {t('commissions') || 'Commissions'}
          </Button>
        </div>

        {/* Tab Content / Tab Məzmunu */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <AffiliateStats />
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            <AffiliateLinkGenerator onLinkCreated={handleLinkCreated} />
            
            <Card>
              <CardHeader>
                <CardTitle>{t('yourLinks') || 'Your Affiliate Links'}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : links.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t('noLinks') || 'No affiliate links yet. Generate your first link above!'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {links.map((link) => (
                      <AffiliateLinkCard key={link.id} link={link} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'commissions' && (
          <AffiliateCommissionHistory />
        )}
      </div>
    </div>
  );
}

