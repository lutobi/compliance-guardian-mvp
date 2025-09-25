#!/usr/bin/env node

const puppeteer = require('puppeteer');

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQxNDkxNjAwLCJzdWIiOiI2ZGU1YzhiZS03NjNkLTQyZDEtOTZmNS1mNWY2MGUzZDdhNDQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsInNlc3Npb25faWQiOiJ0ZXN0LXNlc3Npb24ifQ.8K2UjYrXyKYnpgaKJP9kE6O1pJYsSF_7JUkFpRh-Pds';

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
    page.on('response', async response => {
      const status = response.status();
      if (status >= 400) {
        const text = await response.text();
        console.error('Error response:', response.url(), status, text);
      }
    });

    // Enable request interception
    await page.setRequestInterception(true);

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

    // First go to auth callback to set up session
    await page.goto('http://localhost:3009/api/auth/callback', {
      waitUntil: 'networkidle0'
    });

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
        const session = { 
          access_token: localStorage.getItem('sb-access-token'),
          user: {
            id: '6de5c8be-763d-42d1-96f5-f5f60e3d7a44',
            email: 'test@example.com',
            role: 'authenticated'
          }
        };
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            event: 'SIGNED_IN', 
            session,
            isNewSignIn: true
          })
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

    // Navigate to onboarding with new sign in param
    await page.goto('http://localhost:3009/onboarding?isNewSignIn=true', { 
      waitUntil: 'networkidle0'
    });
    console.log('📍 Navigated to onboarding');

    // Wait for onboarding page to load and auth to be ready
    await Promise.all([
      page.waitForSelector('.container', { timeout: 10000 }),
      page.waitForFunction(() => {
        return !document.querySelector('body')?.classList.contains('loading');
      }, { timeout: 10000 })
    ]);
    console.log('✅ Onboarding page loaded');

    // Step 1: Welcome
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Click the first card and wait for selection
    await Promise.all([
      page.waitForFunction(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        const createCard = Array.from(cards).find(card => 
          card.textContent.includes('Create New') || 
          card.textContent.includes('Start fresh')
        );
        return createCard && createCard.classList.contains('ring-2');
      }, { timeout: 10000 }),
      page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.cursor-pointer'));
        const createCard = cards.find(card => 
          card.textContent.includes('Create New') || 
          card.textContent.includes('Start fresh')
        );
        if (createCard) {
          // Click card and update React state
          createCard.click();
          console.log('Clicked card:', createCard.textContent);

          // Manually dispatch React synthetic event to update userType
          const event = new CustomEvent('click', { bubbles: true });
          event.simulated = true;
          createCard.dispatchEvent(event);
        }
      })
    ]);
    console.log('✅ Selected Create New Workspace');

    // Wait for React state update
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full.max-w-xs');
      return button && !button.disabled;
    }, { timeout: 10000 });

    // Wait for and click continue button
    await Promise.all([
      // Wait for button to be enabled
      page.waitForFunction(() => {
        const button = document.querySelector('button.w-full.max-w-xs');
        return button && !button.disabled;
      }, { timeout: 10000 }),
      // Click continue button
      page.evaluate(() => {
        const button = document.querySelector('button.w-full.max-w-xs');
        if (button && !button.disabled) {
          // Click and dispatch React synthetic event
          button.click();
          const event = new CustomEvent('click', { bubbles: true });
          event.simulated = true;
          button.dispatchEvent(event);
          console.log('Clicked continue button');
        }
      })
    ]);

    // Wait for step transition by checking progress indicator
    await Promise.all([
      // Wait for progress indicator to update
      page.waitForFunction(() => {
        const badge = document.querySelector('div.badge');
        return badge && badge.textContent.includes('Step 2');
      }, { timeout: 10000 }),
      // Wait for workspace setup heading
      page.waitForFunction(() => {
        const heading = document.querySelector('h2');
        return heading && heading.textContent.includes('Create Your Workspace');
      }, { timeout: 10000 }),
      // Wait for loading state to clear
      page.waitForFunction(() => {
        return !document.querySelector('body')?.classList.contains('loading');
      }, { timeout: 10000 })
    ]);
    console.log('✅ Navigated to workspace setup');

    // Wait for workspace form to be fully loaded
    await Promise.all([
      page.waitForSelector('#workspaceName', { timeout: 10000 }),
      page.waitForSelector('#industry', { timeout: 10000 }),
      page.waitForSelector('#companySize', { timeout: 10000 })
    ]);

    // Fill workspace form using React's synthetic events
    await page.evaluate(() => {
      // Helper to create synthetic events
      const createEvent = (type, bubbles = true) => {
        const event = new Event(type, { bubbles });
        event.simulated = true;
        return event;
      };

      // Fill workspace name
      const nameInput = document.querySelector('#workspaceName');
      if (nameInput) {
        nameInput.value = 'Test Workspace';
        nameInput.dispatchEvent(createEvent('input'));
        nameInput.dispatchEvent(createEvent('change'));
      }

      // Wait for slug to auto-generate
      return new Promise(resolve => {
        const checkSlug = setInterval(() => {
          const slugInput = document.querySelector('#workspaceSlug');
          if (slugInput && slugInput.value === 'test-workspace') {
            clearInterval(checkSlug);
            
            // Fill industry and company size
            const industrySelect = document.querySelector('#industry');
            const sizeSelect = document.querySelector('#companySize');
            
            if (industrySelect) {
              industrySelect.value = 'technology';
              industrySelect.dispatchEvent(createEvent('change'));
            }
            
            if (sizeSelect) {
              sizeSelect.value = '1-10';
              sizeSelect.dispatchEvent(createEvent('change'));
            }
            
            resolve();
          }
        }, 100);
      });
    });

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
    await Promise.all([
      // Wait for progress indicator to update
      page.waitForFunction(() => {
        const badge = document.querySelector('div.badge');
        return badge && badge.textContent.includes('Step 3');
      }, { timeout: 15000 }),
      // Wait for profile setup heading
      page.waitForFunction(() => {
        const heading = document.querySelector('h2');
        return heading && heading.textContent.includes('Complete Your Profile');
      }, { timeout: 15000 }),
      // Wait for loading state to clear
      page.waitForFunction(() => {
        return !document.querySelector('body')?.classList.contains('loading');
      }, { timeout: 15000 }),
      // Click continue button
      page.evaluate(() => {
        const createButton = document.querySelector('button.flex-1');
        if (createButton && !createButton.disabled) {
          createButton.click();
          const event = new CustomEvent('click', { bubbles: true });
          event.simulated = true;
          createButton.dispatchEvent(event);
          console.log('Clicked continue button');
        }
      })
    ]);
    console.log('✅ Navigated to profile setup');

    // Wait for profile form to be fully loaded
    await Promise.all([
      page.waitForSelector('#profileName', { timeout: 10000 }),
      page.waitForSelector('#timezone', { timeout: 10000 })
    ]);

    // Fill profile form using React's synthetic events
    await page.evaluate(() => {
      // Helper to create synthetic events
      const createEvent = (type, bubbles = true) => {
        const event = new Event(type, { bubbles });
        event.simulated = true;
        return event;
      };

      // Fill profile name
      const nameInput = document.querySelector('#profileName');
      if (nameInput) {
        nameInput.value = 'Test User';
        nameInput.dispatchEvent(createEvent('input'));
        nameInput.dispatchEvent(createEvent('change'));
      }

      // Set timezone
      const timezoneSelect = document.querySelector('#timezone');
      if (timezoneSelect) {
        timezoneSelect.value = 'UTC';
        timezoneSelect.dispatchEvent(createEvent('change'));
      }
    });

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
    await Promise.all([
      // Wait for progress indicator to update
      page.waitForFunction(() => {
        const badge = document.querySelector('div.badge');
        return badge && badge.textContent.includes('Step 4');
      }, { timeout: 15000 }),
      // Wait for completion heading
      page.waitForFunction(() => {
        const heading = document.querySelector('h2');
        return heading && (
          heading.textContent.includes('All Set') ||
          heading.textContent.includes('Ready to Go')
        );
      }, { timeout: 15000 }),
      // Wait for loading state to clear
      page.waitForFunction(() => {
        return !document.querySelector('body')?.classList.contains('loading');
      }, { timeout: 15000 }),
      // Click continue button
      page.evaluate(() => {
        const continueButton = document.querySelector('button.flex-1');
        if (continueButton && !continueButton.disabled) {
          continueButton.click();
          const event = new CustomEvent('click', { bubbles: true });
          event.simulated = true;
          continueButton.dispatchEvent(event);
          console.log('Clicked continue button');
        }
      })
    ]);
    console.log('✅ Navigated to completion step');

    // Wait for finish button and API call
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full');
      return button && 
             window.getComputedStyle(button).display !== 'none' &&
             !button.disabled;
    }, { timeout: 15000 });

    // Click finish and wait for workspace creation API call and redirect
    await Promise.all([
      // Wait for workspace creation API call
      page.waitForResponse(
        response => response.url().includes('/api/team/init'),
        { timeout: 15000 }
      ),
      // Wait for auth refresh
      page.waitForResponse(
        response => response.url().includes('/auth/v1/token?grant_type=refresh_token'),
        { timeout: 15000 }
      ),
      // Click the finish button
      page.evaluate(() => {
        const button = document.querySelector('button.w-full');
        if (button && !button.disabled) {
          button.click();
          const event = new CustomEvent('click', { bubbles: true });
          event.simulated = true;
          button.dispatchEvent(event);
          console.log('Clicked finish button');
        }
      })
    ]);

    // Wait for workspace creation to complete and redirect
    await Promise.all([
      // Wait for navigation
      page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 15000 
      }),
      // Wait for workspace creation API response
      page.waitForResponse(
        response => response.url().includes('/api/team/init'),
        { timeout: 15000 }
      ).then(async response => {
        const responseText = await response.text();
        console.log('Team init response:', responseText);
        if (!response.ok) {
          throw new Error(`Workspace creation failed: ${responseText}`);
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
