/**
 * Courier Ana Səhifəsi / Courier Home Page
 * Bu səhifə courier welcome səhifəsidir
 * This page is the courier welcome page
 */
export default function CourierHome() {
  // Courier ana səhifəsi - welcome səhifəsi
  // Courier home page - welcome page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Yusu Courier Panel
        </h1>
        <p className="text-gray-600 mb-6">
          Courier paneline xoş gəlmisiniz. Dashboard hazırlanır.
        </p>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            ✅ Courier paneli işləyir
          </div>
          <div className="text-sm text-gray-500">
            ✅ Subdomain routing hazır
          </div>
          <div className="text-sm text-gray-500">
            ✅ Nginx konfiqurasiyası tamamlandı
          </div>
        </div>
      </div>
    </div>
  );
}
