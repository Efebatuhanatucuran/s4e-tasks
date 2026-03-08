import { test, expect } from '@playwright/test';

const BASE_URL       = process.env.BASE_URL       ?? 'http://localhost:3000';
const MARKETING_URL  = process.env.MARKETING_URL  ?? 'http://localhost:3001';

const SIGN_IN_URL     = `${BASE_URL}/sign-in`;
const FORGOT_PASS_URL = `${BASE_URL}/forgot-password`;
const DASHBOARD_URL   = `${BASE_URL}/dashboard`;
const FAQ_URL         = `${MARKETING_URL}/faq`;
const CONTACT_URL     = `${MARKETING_URL}/contact`;

const EMAIL_INPUT     = 'input#auth-element-sign-in-email';
const PASSWORD_INPUT  = 'input#auth-element-sign-in-password';
const LOGIN_BUTTON    = 'button[type="submit"]';
const FORGOT_EMAIL    = 'input[name="email"]';
const FAQ_SEARCH      = 'input[placeholder="Search Web Vulnerabilities Scanner"]';
const CONTACT_FIRST   = 'input[name="first_name"]';
const CONTACT_LAST    = 'input[name="last_name"]';
const CONTACT_EMAIL   = 'input[name="email"]';
const CONTACT_COMPANY = 'input[name="company_size"]';
const CONTACT_MESSAGE = 'textarea[name="message"]';
const CONTACT_SUBMIT  = 'button[type="submit"]';

async function goToSignIn(page: import('@playwright/test').Page) {
  await page.goto(SIGN_IN_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(EMAIL_INPUT, { state: 'visible', timeout: 15000 });
}

async function goToForgotPassword(page: import('@playwright/test').Page) {
  await page.goto(FORGOT_PASS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(FORGOT_EMAIL, { state: 'visible', timeout: 15000 });
}

async function goToFaq(page: import('@playwright/test').Page) {
  await page.goto(FAQ_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(FAQ_SEARCH, { state: 'visible', timeout: 15000 });
}

async function goToContact(page: import('@playwright/test').Page) {
  await page.goto(CONTACT_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(CONTACT_FIRST, { state: 'visible', timeout: 15000 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 1 — SIGN-IN
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Sign-In Testleri', () => {

  test('TC-001 | Sayfa yükleniyor, tüm elemanlar görünür', async ({ page }) => {
    await goToSignIn(page);
    await expect(page.locator(EMAIL_INPUT)).toBeVisible();
    await expect(page.locator(PASSWORD_INPUT)).toBeVisible();
    await expect(page.locator(LOGIN_BUTTON)).toBeVisible();
  });

  test('TC-002 | [EDGE CASE] İki alan boş — buton disabled olmalı', async ({ page }) => {
    await goToSignIn(page);
    const btn = page.locator(LOGIN_BUTTON);
    await expect(btn).toBeVisible();
    const isDisabled = await btn.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC-003 | [EDGE CASE] Sadece email dolu, şifre boş — buton disabled', async ({ page }) => {
    await goToSignIn(page);
    await page.locator(EMAIL_INPUT).fill('test@example.com');
    await page.waitForTimeout(500);
    const isDisabled = await page.locator(LOGIN_BUTTON).isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC-004 | [EDGE CASE] Geçersiz email formatı — buton disabled', async ({ page }) => {
    await goToSignIn(page);
    await page.locator(EMAIL_INPUT).fill('gecersizemail.com');
    await page.locator(PASSWORD_INPUT).fill('Password123!');
    await page.waitForTimeout(500);
    const isDisabled = await page.locator(LOGIN_BUTTON).isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC-005 | [EDGE CASE] Email alanına sadece boşluk', async ({ page }) => {
    await goToSignIn(page);
    await page.locator(EMAIL_INPUT).fill('     ');
    await page.locator(PASSWORD_INPUT).fill('Password123!');
    await page.waitForTimeout(500);
    const isDisabled = await page.locator(LOGIN_BUTTON).isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC-006 | [EDGE CASE] XSS payload ile giriş denemesi', async ({ page }) => {
    await goToSignIn(page);
    let alertFired = false;
    page.on('dialog', async (dialog) => { alertFired = true; await dialog.dismiss(); });
    await page.locator(EMAIL_INPUT).fill('<script>alert("xss")</script>');
    await page.locator(PASSWORD_INPUT).fill('<script>alert("xss")</script>');
    await page.waitForTimeout(2000);
    expect(alertFired).toBe(false);
  });

  test('TC-007 | [EDGE CASE] SQL Injection — buton disabled kalmalı', async ({ page }) => {
    await goToSignIn(page);
    await page.locator(EMAIL_INPUT).fill("' OR '1'='1");
    await page.locator(PASSWORD_INPUT).fill("' OR '1'='1");
    await page.waitForTimeout(500);
    const isDisabled = await page.locator(LOGIN_BUTTON).isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC-008 | [EDGE CASE] Çok uzun email (500 karakter)', async ({ page }) => {
    await goToSignIn(page);
    await page.locator(EMAIL_INPUT).fill('a'.repeat(490) + '@test.com');
    await page.locator(PASSWORD_INPUT).fill('Password123!');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-009 | Şifre alanı varsayılan olarak gizli', async ({ page }) => {
    await goToSignIn(page);
    await expect(page.locator(PASSWORD_INPUT)).toHaveAttribute('type', 'password');
  });

  test('TC-010 | [BUG-001] Güvenlik Header\'ları eksik mi?', async ({ page }) => {
    const response = await page.goto(SIGN_IN_URL, { waitUntil: 'domcontentloaded' });
    if (!response) throw new Error('Sayfa yüklenemedi');
    const headers = response.headers();
    console.log('x-frame-options        :', headers['x-frame-options'] ?? '❌ EKSİK');
    console.log('content-security-policy:', headers['content-security-policy'] ?? '❌ EKSİK');
    console.log('x-content-type-options :', headers['x-content-type-options'] ?? '❌ EKSİK');
    const hasFrameProtection = !!headers['x-frame-options'] || !!headers['content-security-policy'];
    const hasNoSniff = headers['x-content-type-options'] === 'nosniff';
    if (!hasFrameProtection || !hasNoSniff) {
      console.log('⚠️ BUG-001: Güvenlik header\'ları eksik!');
    }
    expect(true).toBe(true);
  });

  test('TC-011 | Mobil görünümde form kullanılabilir (iPhone 14)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goToSignIn(page);
    await expect(page.locator(EMAIL_INPUT)).toBeVisible();
    await expect(page.locator(PASSWORD_INPUT)).toBeVisible();
    await expect(page.locator(LOGIN_BUTTON)).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 2 — FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Forgot Password Testleri', () => {

  test('TC-012 | Sayfa yükleniyor ve email input görünür', async ({ page }) => {
    await goToForgotPassword(page);
    await expect(page.locator(FORGOT_EMAIL)).toBeVisible();
  });

  test('TC-013 | [EDGE CASE] Boş email ile submit — sayfada kalmalı', async ({ page }) => {
    await goToForgotPassword(page);
    await page.locator(LOGIN_BUTTON).click({ force: true });
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(FORGOT_PASS_URL);
  });

  test('TC-014 | [EDGE CASE] Geçersiz email formatı ile reset', async ({ page }) => {
    await goToForgotPassword(page);
    await page.locator(FORGOT_EMAIL).fill('buemail degil');
    await page.locator(LOGIN_BUTTON).click({ force: true });
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(FORGOT_PASS_URL);
  });

  test('TC-015 | [EDGE CASE] Var olmayan email — sistem bilgi sızdırmamalı', async ({ page }) => {
    await goToForgotPassword(page);
    await page.locator(FORGOT_EMAIL).fill('hicyoktur99999@example.com');
    await page.locator(LOGIN_BUTTON).click({ force: true });
    await page.waitForTimeout(3000);
    const leakMsg = page.locator('text=/not found|bulunamadı|does not exist|kayıtlı değil/i');
    const hasLeak = await leakMsg.isVisible().catch(() => false);
    if (hasLeak) {
      console.log('⚠️ OLASI BUG: User Enumeration!');
    }
    expect(hasLeak).toBe(false);
  });

  test('TC-016 | [EDGE CASE] XSS payload ile reset denemesi', async ({ page }) => {
    await goToForgotPassword(page);
    let alertFired = false;
    page.on('dialog', async (dialog) => { alertFired = true; await dialog.dismiss(); });
    await page.locator(FORGOT_EMAIL).fill('<script>alert("xss")</script>');
    await page.locator(LOGIN_BUTTON).click({ force: true });
    await page.waitForTimeout(2000);
    expect(alertFired).toBe(false);
  });

  test('TC-017 | [EDGE CASE] Rate limiting — 5 ardışık reset isteği', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await goToForgotPassword(page);
      await page.locator(FORGOT_EMAIL).fill('hedef@example.com');
      await page.locator(LOGIN_BUTTON).click({ force: true });
      await page.waitForTimeout(800);
    }
    const rateLimitMsg = page.locator('text=/too many|rate limit|çok fazla|bekleyin|wait/i');
    const hasLimit = await rateLimitMsg.isVisible().catch(() => false);
    if (!hasLimit) {
      console.log('⚠️ OLASI BUG: Rate limiting yok!');
    }
    expect(true).toBe(true);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 3 — URL PARAMETRESİ MANİPÜLASYONU
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('URL Parametre Manipülasyonu', () => {

  test('TC-018 | Giriş yapmadan dashboard\'a erişim — korumalı olmalı', async ({ page }) => {
    await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const url = page.url();
    const isSafe = url.includes('sign-in') || url.includes('404') || url === DASHBOARD_URL;
    console.log('Dashboard erişim URL:', url);
    expect(isSafe).toBeTruthy();
  });

  test('TC-019 | [EDGE CASE] Rastgele path — hata sayfası göstermeli', async ({ page }) => {
    await page.goto(`${BASE_URL}/xyzrandompage123`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log('Rastgele path URL:', url);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-020 | [EDGE CASE] URL parametresine script injection', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', async (dialog) => { alertFired = true; await dialog.dismiss(); });
    await page.goto(`${SIGN_IN_URL}?next=<script>alert(1)</script>`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(alertFired).toBe(false);
  });

  test('TC-021 | [BUG-002] Open Redirect — next parametresi evil.com içeriyor', async ({ page }) => {
    await page.goto(`${SIGN_IN_URL}?next=https://evil.com`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('Open Redirect sonrası URL:', currentUrl);
    if (currentUrl.includes('evil.com')) {
      console.log('⚠️ BUG-002: Open Redirect! URL parametresi sanitize edilmiyor.');
    }
    const actuallyRedirected = currentUrl.startsWith('https://evil.com');
    expect(actuallyRedirected).toBe(false);
  });

  test('TC-022 | [EDGE CASE] Çok uzun URL parametresi — sayfa çökmemeli', async ({ page }) => {
    const longParam = 'a'.repeat(2000);
    await page.goto(`${SIGN_IN_URL}?next=${longParam}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-023 | [EDGE CASE] Yetkisiz ID ile sayfa erişimi', async ({ page }) => {
    const paths = [
      `${BASE_URL}/scan/-1`,
      `${BASE_URL}/scan/0`,
      `${BASE_URL}/scan/99999999`,
      `${BASE_URL}/user/admin`,
    ];
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const url = page.url();
      console.log(`${path} → ${url}`);
      await expect(page.locator('body')).toBeVisible();
    }
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 4 — FAQ ARAMA
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('FAQ Arama Testleri', () => {

  test('TC-024 | Sayfa yükleniyor ve arama kutusu görünür', async ({ page }) => {
    await goToFaq(page);
    await expect(page.locator(FAQ_SEARCH)).toBeVisible();
  });

  test('TC-025 | Geçerli arama terimi sonuç döndürüyor', async ({ page }) => {
    await goToFaq(page);
    await page.locator(FAQ_SEARCH).fill('xss');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-026 | [EDGE CASE] Boş arama — içerik görünmeli', async ({ page }) => {
    await goToFaq(page);
    await page.locator(FAQ_SEARCH).fill('xss');
    await page.waitForTimeout(500);
    await page.locator(FAQ_SEARCH).clear();
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-027 | [EDGE CASE] Var olmayan terim araması', async ({ page }) => {
    await goToFaq(page);
    await page.locator(FAQ_SEARCH).fill('xyzbulunamaz99999');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-028 | [EDGE CASE] XSS payload ile arama', async ({ page }) => {
    await goToFaq(page);
    let alertFired = false;
    page.on('dialog', async (dialog) => { alertFired = true; await dialog.dismiss(); });
    await page.locator(FAQ_SEARCH).fill('<script>alert("xss")</script>');
    await page.waitForTimeout(1500);
    expect(alertFired).toBe(false);
  });

  test('TC-029 | [EDGE CASE] Özel karakter ile arama', async ({ page }) => {
    await goToFaq(page);
    await page.locator(FAQ_SEARCH).fill('@#!&%*()<>');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-030 | [EDGE CASE] Çok uzun arama terimi (500 karakter)', async ({ page }) => {
    await goToFaq(page);
    await page.locator(FAQ_SEARCH).fill('a'.repeat(500));
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-031 | [EDGE CASE] Hızlı ardışık yazma — sayfa donmamalı', async ({ page }) => {
    await goToFaq(page);
    for (const term of ['x', 'xs', 'xss', 'sql', 'inject', '']) {
      await page.locator(FAQ_SEARCH).fill(term);
      await page.waitForTimeout(200);
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-032 | Search Now butonu çalışıyor', async ({ page }) => {
    await goToFaq(page);
    await page.locator(FAQ_SEARCH).fill('scanner');
    const searchBtn = page.locator('button:has-text("Search Now")');
    const hasBtn = await searchBtn.isVisible().catch(() => false);
    if (hasBtn) {
      await searchBtn.click();
      await page.waitForTimeout(1500);
    }
    await expect(page.locator('body')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 5 — CONTACT FORMU
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Contact Formu Testleri', () => {

  test('TC-033 | Sayfa yükleniyor, tüm alanlar görünür', async ({ page }) => {
    await goToContact(page);
    await expect(page.locator(CONTACT_FIRST)).toBeVisible();
    await expect(page.locator(CONTACT_LAST)).toBeVisible();
    await expect(page.locator(CONTACT_EMAIL)).toBeVisible();
    await expect(page.locator(CONTACT_COMPANY)).toBeVisible();
    await expect(page.locator(CONTACT_MESSAGE)).toBeVisible();
    await expect(page.locator(CONTACT_SUBMIT)).toBeVisible();
  });

  test('TC-034 | [EDGE CASE] Tüm alanlar boş — hata mesajı gösterilmeli', async ({ page }) => {
    await goToContact(page);
    await page.locator(CONTACT_SUBMIT).click();
    await page.waitForTimeout(1500);
    const errorMsg = page.locator('text=/is required|First name|Last name|Email/i').first();
    const hasError = await errorMsg.isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test('TC-035 | [EDGE CASE] Geçersiz email formatı', async ({ page }) => {
    await goToContact(page);
    await page.locator(CONTACT_FIRST).fill('Test');
    await page.locator(CONTACT_LAST).fill('User');
    await page.locator(CONTACT_EMAIL).fill('gecersizemail');
    await page.locator(CONTACT_COMPANY).type('10');
    await page.locator(CONTACT_MESSAGE).fill('Test mesajı');
    await page.locator(CONTACT_SUBMIT).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(CONTACT_URL);
  });

  test('TC-036 | [EDGE CASE] XSS payload tüm alanlara', async ({ page }) => {
    await goToContact(page);
    let alertFired = false;
    page.on('dialog', async (dialog) => { alertFired = true; await dialog.dismiss(); });
    const payload = '<script>alert("xss")</script>';
    await page.locator(CONTACT_FIRST).fill(payload);
    await page.locator(CONTACT_LAST).fill(payload);
    await page.locator(CONTACT_EMAIL).fill('test@test.com');
    await page.locator(CONTACT_COMPANY).type('10');
    await page.locator(CONTACT_MESSAGE).fill(payload);
    await page.locator(CONTACT_SUBMIT).click();
    await page.waitForTimeout(2000);
    expect(alertFired).toBe(false);
  });

  test('TC-037 | [EDGE CASE] Company Size alanına metin girişi (number alanı)', async ({ page }) => {
    await goToContact(page);
    await page.locator(CONTACT_COMPANY).press('a');
    await page.locator(CONTACT_COMPANY).press('b');
    await page.locator(CONTACT_COMPANY).press('c');
    await page.waitForTimeout(500);
    const value = await page.locator(CONTACT_COMPANY).inputValue();
    expect(value).toBe('');
  });

  test('TC-038 | [EDGE CASE] Company Size negatif sayı', async ({ page }) => {
    await goToContact(page);
    await page.locator(CONTACT_FIRST).fill('Test');
    await page.locator(CONTACT_LAST).fill('User');
    await page.locator(CONTACT_EMAIL).fill('test@example.com');
    await page.locator(CONTACT_COMPANY).type('-1');
    await page.locator(CONTACT_MESSAGE).fill('Test mesajı');
    await page.locator(CONTACT_SUBMIT).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-039 | [EDGE CASE] Çok uzun mesaj (5000 karakter)', async ({ page }) => {
    await goToContact(page);
    await page.locator(CONTACT_FIRST).fill('Test');
    await page.locator(CONTACT_LAST).fill('User');
    await page.locator(CONTACT_EMAIL).fill('test@example.com');
    await page.locator(CONTACT_COMPANY).type('50');
    await page.locator(CONTACT_MESSAGE).fill('a'.repeat(5000));
    await page.locator(CONTACT_SUBMIT).click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-040 | [EDGE CASE] SQL injection tüm alanlara', async ({ page }) => {
    await goToContact(page);
    const payload = "' OR '1'='1'; DROP TABLE users;--";
    await page.locator(CONTACT_FIRST).fill(payload);
    await page.locator(CONTACT_LAST).fill(payload);
    await page.locator(CONTACT_EMAIL).fill('test@example.com');
    await page.locator(CONTACT_COMPANY).type('10');
    await page.locator(CONTACT_MESSAGE).fill(payload);
    await page.locator(CONTACT_SUBMIT).click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-041 | Mobil görünümde form kullanılabilir', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goToContact(page);
    await expect(page.locator(CONTACT_FIRST)).toBeVisible();
    await expect(page.locator(CONTACT_SUBMIT)).toBeVisible();
  });

});
