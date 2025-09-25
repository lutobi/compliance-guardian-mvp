#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function testOnboardingFlow() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Create test user
    const email = `test-${Date.now()}@example.com`;
    const password = 'testpass123';
    
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (createError) throw createError;
    console.log('✅ Created test user:', user.id);

    // Create user profile with onboarding_completed = false
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email,
        name: 'Test User',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;
    console.log('✅ Created user profile');

    // Get auth token first
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!session?.access_token) {
      throw new Error('Failed to get session token');
    }

    // Test login flow - Start fresh without any stored state
    await page.goto('http://localhost:3009/auth/login', {
      waitUntil: 'networkidle0'
    });
    console.log('📍 Navigated to login page');

    // Wait for form to be interactive
    await page.waitForSelector('input[type="email"]', { visible: true });
    await page.waitForSelector('input[type="password"]', { visible: true });

    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);

    // Submit form and wait for auth state update
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    console.log('📍 Submitted login form');

    // Check for error message
    const errorElement = await page.$('.bg-red-50');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      throw new Error(`Login failed: ${errorText}`);
    }

    // Set required environment variables and auth token after successful login
    await page.evaluate(({ url, token }) => {
      window.localStorage.setItem('supabase.url', url);
      window.localStorage.setItem('supabase.key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE3OTgsImV4cCI6MjA2MjY2Nzc5OH0.aPQx_MYNjsFfBIZVAeN9yTqLkxHZVMkRPLxp-T7zYqU');
      window.localStorage.setItem('sb-access-token', token);
      window.localStorage.setItem('mt_session', token);
      window.localStorage.setItem('sb-refresh-token', token);
      window.localStorage.setItem('sb-provider-token', token);
    }, { url: supabaseUrl, token: session.access_token });

    // Set auth cookies
    const cookies = [
      {
        name: 'sb-access-token',
        value: session.access_token,
        domain: 'localhost',
        path: '/',
        httpOnly: true
      },
      {
        name: 'sb-refresh-token',
        value: session.refresh_token,
        domain: 'localhost',
        path: '/',
        httpOnly: true
      }
    ];
    await page.setCookie(...cookies);

    // Navigate to onboarding
    await page.goto('http://localhost:3009/onboarding', {
      waitUntil: 'networkidle0'
    });
    console.log('📍 Navigated to onboarding');

    // Wait for onboarding page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    console.log('✅ Onboarding page loaded');

    // Step 1: Welcome - Select "Create New Workspace"
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    
    // Click the first card and verify selection
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      const createCard = cards[0];
      if (createCard) {
        createCard.click();
      }
    });
    
    // Wait for card selection to be reflected in UI and state
    await page.waitForFunction(() => {
      const createCard = document.querySelector('.cursor-pointer');
      const button = document.querySelector('button');
      return createCard && 
             createCard.classList.contains('ring-2') && 
             createCard.classList.contains('ring-blue-500') &&
             button && !button.disabled;
    }, { timeout: 10000 });
    console.log('✅ Selected Create New Workspace');

    // Click continue and wait for next step
    await Promise.all([
      page.waitForFunction(() => {
        const form = document.querySelector('#workspaceName');
        return form && window.getComputedStyle(form).display !== 'none';
      }, { timeout: 10000 }),
      page.evaluate(() => {
        const button = document.querySelector('button');
        if (button && !button.disabled) {
          button.click();
        }
      })
    ]);
    console.log('✅ Clicked continue after workspace selection');

    // Step 2: Workspace Setup - Fill out form
    await page.waitForSelector('#workspaceName', { visible: true });
    await page.waitForSelector('#workspaceSlug', { visible: true });
    await page.waitForSelector('#industry', { visible: true });
    await page.waitForSelector('#companySize', { visible: true });

    // Type workspace name and wait for slug to auto-populate
    await page.type('#workspaceName', 'Test Workspace');
    await page.waitForFunction(() => {
      const slugInput = document.querySelector('#workspaceSlug');
      return slugInput && slugInput.value === 'test-workspace';
    }, { timeout: 10000 });

    // Select industry and company size
    await page.select('#industry', 'technology');
    await page.select('#companySize', '1-10');

    // Wait for form validation to complete
    await page.waitForFunction(() => {
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      const nameInput = document.querySelector('#workspaceName');
      const slugInput = document.querySelector('#workspaceSlug');
      const industrySelect = document.querySelector('#industry');
      const sizeSelect = document.querySelector('#companySize');
      
      return button && !button.disabled &&
             nameInput && nameInput.value.length > 0 &&
             slugInput && slugInput.value.length > 0 &&
             industrySelect && industrySelect.value === 'technology' &&
             sizeSelect && sizeSelect.value === '1-10';
    }, { timeout: 10000 });

    // Click Create Workspace and wait for API call
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/team/init'),
        { timeout: 15000 }
      ),
      page.waitForFunction(() => {
        const form = document.querySelector('#profileName');
        return form && window.getComputedStyle(form).display !== 'none';
      }, { timeout: 15000 }),
      page.evaluate(() => {
        const button = document.querySelector('button.flex-1:not([variant="outline"])');
        if (button && !button.disabled) {
          button.click();
        }
      })
    ]);
    console.log('✅ Submitted workspace form');

    // Step 3: Profile Setup - Fill out form
    await page.waitForSelector('#profileName', { visible: true });
    await page.waitForSelector('#timezone', { visible: true });
    
    await page.type('#profileName', 'Test User');
    await page.select('#timezone', 'UTC');

    // Wait for form validation
    await page.waitForFunction(() => {
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      const nameInput = document.querySelector('#profileName');
      const timezoneSelect = document.querySelector('#timezone');
      
      return button && !button.disabled &&
             nameInput && nameInput.value.length > 0 &&
             timezoneSelect && timezoneSelect.value === 'UTC';
    }, { timeout: 10000 });

    // Submit profile and wait for next step
    await Promise.all([
      page.waitForFunction(() => {
        const button = document.querySelector('button.w-full');
        return button && window.getComputedStyle(button).display !== 'none';
      }, { timeout: 15000 }),
      page.evaluate(() => {
        const button = document.querySelector('button.flex-1:not([variant="outline"])');
        if (button && !button.disabled) {
          button.click();
        }
      })
    ]);
    console.log('✅ Submitted profile form');

    // Step 4: Completion - Wait for finish button
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full');
      return button && window.getComputedStyle(button).display !== 'none' && !button.disabled;
    }, { timeout: 15000 });

    // Click finish and wait for redirect
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      page.evaluate(() => {
        const button = document.querySelector('button.w-full');
        if (button && !button.disabled) {
          button.click();
        }
      })
    ]);
    console.log('✅ Clicked finish');

    // Verify redirect to dashboard
    const dashboardUrl = page.url();
    if (!dashboardUrl.includes('/dashboard')) {
      throw new Error(`Expected redirect to dashboard, got ${dashboardUrl}`);
    }
    console.log('✅ Workspace creation and redirect successful');

    // Verify workspace data
    const { data: workspace, error: getWorkspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (getWorkspaceError) throw getWorkspaceError;
    console.log('✅ Workspace created:', workspace);

    // Verify onboarding completed
    const { data: profile, error: getProfileError } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (getProfileError) throw getProfileError;
    if (!profile.onboarding_completed) {
      throw new Error('Onboarding not marked as completed');
    }
    console.log('✅ Onboarding marked as completed');

    // Test session persistence
    await page.goto(dashboardUrl + '/settings');
    await page.waitForSelector('[data-testid="workspace-name"]', { timeout: 15000 });
    console.log('✅ Session persisted across navigation');

    console.log('✅ All onboarding tests passed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.error('Screenshot saved to error-screenshot.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testOnboardingFlow();
