/**
 * Next.js Instrumentation / Next.js Instrumentation
 * Initializes OpenTelemetry tracing when the application starts
 * Tətbiq başladıqda OpenTelemetry tracing-i işə salır
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Only initialize tracing on server-side / Yalnız server-side-da tracing işə sal
      const { initializeTracing } = await import('@/lib/monitoring/tracing');
      await initializeTracing();
    } catch (error) {
      // Silently fail if tracing is not configured / Əgər tracing konfiqurasiya edilməyibsə, səssizcə uğursuz ol
      console.warn('Failed to initialize tracing / Tracing işə salmaq uğursuz oldu:', error);
    }
    
    try {
      // Initialize APM on server-side / Server-side-da APM işə sal
      const { initializeAPM } = await import('@/lib/monitoring/apm');
      initializeAPM();
    } catch (error) {
      // Silently fail if APM is not configured / Əgər APM konfiqurasiya edilməyibsə, səssizcə uğursuz ol
      console.warn('Failed to initialize APM / APM işə salmaq uğursuz oldu:', error);
    }
    
    try {
      // Start alert checking on server-side / Server-side-da alert yoxlamasını başlat
      const { startAlertChecking } = await import('@/lib/monitoring/alerts');
      startAlertChecking();
    } catch (error) {
      // Silently fail if alert system is not configured / Əgər alert sistemi konfiqurasiya edilməyibsə, səssizcə uğursuz ol
      console.warn('Failed to start alert checking / Alert yoxlamasını başlatmaq uğursuz oldu:', error);
    }
    
    try {
      // Initialize Sentry on server startup / Server başlananda Sentry-ni başlat
      const { initSentry } = await import('@/lib/monitoring/sentry');
      initSentry();
    } catch (error) {
      // Silently fail if Sentry is not configured / Əgər Sentry konfiqurasiya edilməyibsə, səssizcə uğursuz ol
      console.warn('Failed to initialize Sentry / Sentry-ni işə salmaq uğursuz oldu:', error);
    }
    
    try {
      // Initialize log aggregator on server-side / Server-side-da log aggregator-i işə sal
      const { initializeLogAggregator } = await import('@/lib/logging/log-aggregator');
      initializeLogAggregator();
    } catch (error) {
      // Silently fail if log aggregation is not configured / Əgər log aggregation konfiqurasiya edilməyibsə, səssizcə uğursuz ol
      console.warn('Failed to initialize log aggregator / Log aggregator-i işə salmaq uğursuz oldu:', error);
    }
    
    try {
      // Initialize event bus on server-side / Server-side-da event bus-i işə sal
      const { initializeEventBus } = await import('@/lib/events/event-bus');
      initializeEventBus();
      
      // Register order event handlers / Sifariş event handler-lərini qeydiyyatdan keçir
      const { registerOrderEventHandlers } = await import('@/lib/events/order-events');
      registerOrderEventHandlers();
      
      // Register product event handlers / Məhsul event handler-lərini qeydiyyatdan keçir
      const { registerProductEventHandlers } = await import('@/lib/events/product-events');
      registerProductEventHandlers();
      
      // Register user event handlers / İstifadəçi event handler-lərini qeydiyyatdan keçir
      const { registerUserEventHandlers } = await import('@/lib/events/user-events');
      registerUserEventHandlers();
    } catch (error) {
      // Silently fail if event bus is not configured / Əgər event bus konfiqurasiya edilməyibsə, səssizcə uğursuz ol
      console.warn('Failed to initialize event bus / Event bus-i işə salmaq uğursuz oldu:', error);
    }
  }
}

