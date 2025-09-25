#!/usr/bin/env node

const puppeteer = require('puppeteer');

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQxNDkxNjAwLCJzdWIiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsInNlc3Npb25faWQiOiJ0ZXN0LXNlc3Npb24ifQ.8K2UjYrXyKYnpgaKJP9kE6O1pJYsSF_7JUkFpRh-Pds';

async function testOnboardingFlow() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Enable verbose logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.error('Browser Error:', err.message));
    page.on('requestfailed', request => 
      console.error('Failed request:', request.url(), request.failure().errorText)
    );
    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        console.error('Error response:', response.url(), status);
      }
    });

    // Enable request interception
    await page.setRequestInterception(true);
    let workspaceCreated = false;
    let profileUpdated = false;

    page.on('request', request => {
      const url = request.url();
      const headers = request.headers();
      
      // Add auth header for API calls
      if (url.includes('/api/')) {
        headers['Authorization'] = `Bearer ${mockToken}`;
        request.continue({ headers });
      } else {
        request.continue();
      }

      console.log('Request:', url);
      if (url.includes('/api/team/init')) {
        console.log('Team init request body:', request.postData());
      }
    });

    // Set up mock auth state
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle0' });
    
    // Wait for auth hydration
    await page.waitForFunction(() => {
      return !document.querySelector('body')?.classList.contains('loading');
    }, { timeout: 10000 });

    // Set up auth state
    await page.evaluate(({ token }) => {
      window.localStorage.setItem('supabase.url', 'http://localhost:54321');
      window.localStorage.setItem('supabase.key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE3OTgsImV4cCI6MjA2MjY2Nzc5OH0.aPQx_MYNjsFfBIZVAeN9yTqLkxHZVMkRPLxp-T7zYqU');
      window.localStorage.setItem('sb-access-token', token);
      window.localStorage.setItem('mt_session', token);
      window.localStorage.setItem('sb-refresh-token', token);
      window.localStorage.setItem('sb-provider-token', token);
      
      // Debug auth state
      console.log('Auth state set:', {
        token: token.slice(0, 20),
        localStorage: Object.keys(localStorage)
          .filter(key => key.startsWith('sb-') || key.startsWith('supabase.'))
          .reduce((acc, key) => ({ ...acc, [key]: localStorage.getItem(key)?.slice(0, 20) }), {})
      });
    }, { token: mockToken });

    await page.setCookie({
      name: 'sb-access-token',
      value: mockToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });

    // Sync auth cookies
    await page.evaluate(async () => {
      try {
        const session = { access_token: localStorage.getItem('sb-access-token') };
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ event: 'SIGNED_IN', session })
        });
        
        if (!response.ok) {
          throw new Error(`Auth callback failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Auth callback result:', result);
      } catch (e) {
        console.warn('Failed to sync auth cookies:', e);
      }
    });

    // Navigate to onboarding
    await page.goto('http://localhost:3009/onboarding', { waitUntil: 'networkidle0' });
    console.log('📍 Navigated to onboarding');

    // Wait for onboarding page to load and auth to be ready
    await Promise.all([
      page.waitForSelector('.container', { timeout: 10000 }),
      page.waitForFunction(() => {
        const authState = window.__NEXT_DATA__?.props?.pageProps?.initialState?.auth;
        return authState && !authState.loading;
      }, { timeout: 10000 })
    ]);
    console.log('✅ Onboarding page loaded');

    // Debug auth state
    const authState = await page.evaluate(() => {
      const state = window.__NEXT_DATA__?.props?.pageProps?.initialState?.auth;
      return {
        loading: state?.loading,
        session: state?.session ? {
          ...state.session,
          access_token: state.session.access_token?.slice(0, 20)
        } : null
      };
    });
    console.log('Auth state:', authState);

    // Step 1: Welcome
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Click the first card
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.cursor-pointer'));
      const createCard = cards.find(card => 
        card.textContent.includes('Create New') || 
        card.textContent.includes('Start fresh')
      );
      if (createCard) {
        createCard.click();
        console.log('Clicked card:', createCard.textContent);
      }
    });

    // Wait for card selection UI update
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      const createCard = Array.from(cards).find(card => 
        card.textContent.includes('Create New') || 
        card.textContent.includes('Start fresh')
      );
      return createCard && 
             createCard.classList.contains('ring-2') && 
             createCard.classList.contains('ring-blue-500');
    }, { timeout: 10000 });
    console.log('✅ Selected Create New Workspace');

    // Wait for and click continue button
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full.max-w-xs');
      return button && !button.disabled;
    }, { timeout: 10000 });

    // Click continue and wait for loading state
    await page.evaluate(() => {
      window.__buttonClicked = false;
      window.__stepTransitioned = false;

      const observer = new MutationObserver((mutations) => {
        const heading = document.querySelector('h2');
        if (heading && heading.textContent.includes('Create Your Workspace')) {
          window.__stepTransitioned = true;
          observer.disconnect();
        }
      });

      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
      });

      const button = document.querySelector('button.w-full.max-w-xs');
      if (button && !button.disabled) {
        button.click();
        window.__buttonClicked = true;
        console.log('Clicked continue button');
      }
    });

    // Wait for step transition
    await page.waitForFunction(() => {
      return window.__buttonClicked && window.__stepTransitioned;
    }, { timeout: 10000 });
    console.log('✅ Navigated to workspace setup');

    // Fill workspace form
    await page.type('#workspaceName', 'Test Workspace');
    await page.waitForFunction(() => {
      const slugInput = document.querySelector('#workspaceSlug');
      return slugInput && slugInput.value === 'test-workspace';
    }, { timeout: 5000 });

    await page.select('#industry', 'technology');
    await page.select('#companySize', '1-10');

    // Wait for form validation and button state
    await page.waitForFunction(() => {
      const createButton = document.querySelector('button.flex-1');
      const nameInput = document.querySelector('#workspaceName');
      const slugInput = document.querySelector('#workspaceSlug');
      const industrySelect = document.querySelector('#industry');
      const sizeSelect = document.querySelector('#companySize');
      
      return createButton && !createButton.disabled &&
             nameInput && nameInput.value === 'Test Workspace' &&
             slugInput && slugInput.value === 'test-workspace' &&
             industrySelect && industrySelect.value === 'technology' &&
             sizeSelect && sizeSelect.value === '1-10';
    }, { timeout: 10000 });

    // Click continue and wait for profile step
    await page.evaluate(() => {
      const createButton = document.querySelector('button.flex-1');
      if (createButton && !createButton.disabled) {
        createButton.click();
        console.log('Clicked continue button');
      }
    });

    // Wait for profile step to load
    await page.waitForFunction(() => {
      const heading = document.querySelector('h2');
      return heading && heading.textContent.includes('Complete Your Profile');
    }, { timeout: 15000 });
    console.log('✅ Navigated to profile setup');

    // Fill profile form
    await page.type('#profileName', 'Test User');
    await page.select('#timezone', 'UTC');

    // Wait for form validation
    await page.waitForFunction(() => {
      const continueButton = document.querySelector('button.flex-1');
      const nameInput = document.querySelector('#profileName');
      const timezoneSelect = document.querySelector('#timezone');
      
      return continueButton && !continueButton.disabled &&
             nameInput && nameInput.value === 'Test User' &&
             timezoneSelect && timezoneSelect.value === 'UTC';
    }, { timeout: 10000 });

    // Click continue and wait for completion step
    await page.evaluate(() => {
      const continueButton = document.querySelector('button.flex-1');
      if (continueButton && !continueButton.disabled) {
        continueButton.click();
        console.log('Clicked continue button');
      }
    });

    // Wait for completion step to load
    await page.waitForFunction(() => {
      const heading = document.querySelector('h2');
      return heading && (
        heading.textContent.includes('All Set') ||
        heading.textContent.includes('Ready to Go')
      );
    }, { timeout: 15000 });
    console.log('✅ Navigated to completion step');

    // Wait for finish button and API call
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full');
      return button && 
             window.getComputedStyle(button).display !== 'none' &&
             !button.disabled;
    }, { timeout: 15000 });

    // Click finish and wait for workspace creation API call
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/team/init'),
        { timeout: 15000 }
      ),
      page.evaluate(() => {
        const button = document.querySelector('button.w-full');
        if (button && !button.disabled) {
          button.click();
          console.log('Clicked finish button');
        }
      })
    ]);

    // Wait for redirect after workspace creation
    await page.waitForNavigation({ 
      waitUntil: 'networkidle0',
      timeout: 15000 
    });
    console.log('✅ Clicked finish');

    // Verify redirect to dashboard
    const dashboardUrl = page.url();
    if (!dashboardUrl.includes('/dashboard')) {
      throw new Error(`Expected redirect to dashboard, got ${dashboardUrl}`);
    }
    console.log('✅ Workspace creation and redirect successful');

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
