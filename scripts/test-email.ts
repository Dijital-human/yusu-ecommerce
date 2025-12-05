/**
 * Ecommerce Email Service Test Script / E-commerce Email Xidməti Test Skripti
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sendEmail, isEmailConfigured, getEmailService } from '../src/lib/email';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function testEmailSending() {
  console.log('🧪 Ecommerce Email Service Test / E-commerce Email Xidməti Testi\n');
  console.log('='.repeat(60));

  console.log('\n1️⃣ Checking email configuration / Email konfiqurasiyasını yoxlayır...');
  const configured = isEmailConfigured();
  const providers = getEmailService().getAvailableProviders();

  if (!configured) {
    console.error('❌ No email providers configured / Email provider konfiqurasiya edilməyib');
    console.log('\n📝 Required environment variables:');
    console.log('   RESEND_API_KEY və ya SMTP_* və ya SENDGRID_API_KEY');
    return;
  }

  console.log('✅ Email service is configured / Email xidməti konfiqurasiya olunub');
  console.log(`📦 Available providers / Mövcud provider-lər: ${providers.join(', ')}`);

  const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER || 'test@example.com';
  console.log(`\n2️⃣ Test email address / Test email ünvanı: ${testEmail}`);

  const emailPayload = {
    to: testEmail,
    subject: '🧪 Yusu Ecommerce Email Service Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f97316; color: #fff; padding: 16px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Yusu Ecommerce Email Test</h1>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px;">
          <p>Bu mesaj vahid email servisinin marketplace tətbiqində işlədiyini yoxlamaq üçündür.</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Providers:</strong> ${providers.join(', ') || 'None'}</p>
        </div>
      </div>
    `,
    text: `Yusu Ecommerce Email Test - Providers: ${providers.join(', ')}`,
  };

  console.log('\n3️⃣ Sending test email / Test email göndərilir...');
  console.log('   ⏳ Please wait... / Zəhmət olmasa gözləyin...');

  try {
    const start = Date.now();
    const result = await sendEmail(
      emailPayload.to as string,
      emailPayload.subject,
      emailPayload.html,
      emailPayload.text || ''
    );
    const duration = Date.now() - start;

    if (result.success) {
      console.log('✅ Email sent successfully! / Email uğurla göndərildi!');
      console.log(`   📧 Provider: ${result.provider || 'Unknown'}`);
      console.log(`   🆔 Message ID: ${result.messageId || 'N/A'}`);
      console.log(`   ⏱️ Duration: ${duration}ms`);
    } else {
      console.error('❌ Email sending failed / Email göndərmə uğursuz oldu');
      console.error(`   Error: ${result.error}`);
    }
  } catch (error: any) {
    console.error('❌ Unexpected error / Gözlənilməz xəta:', error.message);
  }

  console.log('\n' + '='.repeat(60));
}

async function testProviderFallback() {
  console.log('\n🔄 Testing provider fallback / Provider fallback test edilir...\n');
  const providers = getEmailService().getAvailableProviders();
  console.log(`Available providers / Mövcud provider-lər: ${providers.join(' → ') || 'None'}`);

  if (providers.length > 1) {
    console.log('✅ Multiple providers available - fallback ready');
  } else if (providers.length === 1) {
    console.log('⚠️ Only one provider available - no fallback');
  } else {
    console.log('❌ No providers available');
  }
}

async function main() {
  try {
    await testEmailSending();
    await testProviderFallback();
  } catch (error) {
    console.error('❌ Test failed / Test uğursuz oldu:', error);
    process.exit(1);
  }
}

main();

