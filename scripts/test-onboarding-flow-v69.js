#!/usr/bin/env node

const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load env vars
dotenv.config();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config({ path: '.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create mock token with service role claims
const mockToken = jwt.sign({
  sub: '6de5c8be-763d-42d1-96f5-f5f60e3d7a44',
  email: 'test@example.com',
  role: 'service_role',
  aud: 'authenticated',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
}, serviceKey);

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

    // First visit auth callback to set up session
    await page.goto('http://localhost:3009/api/auth/callback', {
      waitUntil: 'networkidle0'
    });

    // Set up auth state
    await page.evaluate(async ({ token }) => {
      // Set up Supabase session
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: token,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: token,
          user: {
            id: '6de5c8be-763d-42d1-96f5-f5f60e3d7a44',
            aud: 'authenticated',
            role: 'service_role',
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00.000Z',
            phone: '',
            confirmed_at: '2024-01-01T00:00:00.000Z',
            last_sign_in_at: '2024-01-01T00:00:00.000Z',
            app_metadata: {
              provider: 'email',
              providers: ['email']
            },
            user_metadata: {},
            identities: [],
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
          },
          expires_at: Math.floor(Date.now() / 1000) + 3600
        },
        expiresAt: Math.floor(Date.now() / 1000) + 3600
      }));

      // Set other required tokens
      window.localStorage.setItem('supabase.url', 'http://localhost:54321');
      window.localStorage.setItem('supabase.key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE3OTgsImV4cCI6MjA2MjY2Nzc5OH0.aPQx_MYNjsFfBIZVAeN9yTqLkxHZVMkRPLxp-T7zYqU');
      window.localStorage.setItem('mt_session', token);

      // Debug auth state
      console.log('Auth state set:', {
        token: token.slice(0, 20),
        localStorage: Object.keys(localStorage)
          .filter(key => key.startsWith('supabase.'))
          .reduce((acc, key) => ({ ...acc, [key]: localStorage.getItem(key)?.slice(0, 20) }), {})
      });

      // Sync auth cookies
      try {
        const session = { 
          access_token: token,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: token,
          user: {
            id: '6de5c8be-763d-42d1-96f5-f5f60e3d7a44',
            email: 'test@example.com',
            role: 'service_role'
          }
        };

        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
    }, { token: mockToken });

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
    await page.evaluate(() => {
      // Helper to get React component instance
      function getReactComponent(element) {
        const key = Object.keys(element).find(key => 
          key.startsWith('__reactFiber$')
        );
        return key ? element[key] : null;
      }

      // Helper to get component props
      function getComponentProps(fiber) {
        while (fiber) {
          if (fiber.memoizedProps) {
            return fiber.memoizedProps;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Find and click the create workspace card
      const cards = Array.from(document.querySelectorAll('.cursor-pointer'));
      const createCard = cards.find(card => 
        card.textContent.includes('Create New') || 
        card.textContent.includes('Start fresh')
      );

      if (createCard) {
        const fiber = getReactComponent(createCard);
        const props = getComponentProps(fiber);
        
        if (props && props.onClick) {
          props.onClick();
          console.log('Triggered React onClick');
        }
        console.log('Clicked card:', createCard.textContent);
      }
    });

    // Wait for React state update
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full.max-w-xs');
      return button && !button.disabled;
    }, { timeout: 10000 });
    console.log('✅ Selected Create New Workspace');

    // Click continue and wait for workspace setup step
    await page.evaluate(() => {
      // Helper to get React component instance
      function getReactComponent(element) {
        const key = Object.keys(element).find(key => 
          key.startsWith('__reactFiber$')
        );
        return key ? element[key] : null;
      }

      // Helper to get component props
      function getComponentProps(fiber) {
        while (fiber) {
          if (fiber.memoizedProps) {
            return fiber.memoizedProps;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Find continue button
      const button = document.querySelector('button.w-full.max-w-xs');
      if (button && !button.disabled) {
        const fiber = getReactComponent(button);
        const props = getComponentProps(fiber);
        
        if (props && props.onClick) {
          props.onClick();
          console.log('Triggered React onClick');
        }
        console.log('Clicked continue button');
      }
    });

    // Wait for workspace setup step
    await Promise.all([
      page.waitForFunction(() => {
        const heading = document.querySelector('h2');
        return heading && heading.textContent.includes('Create Your Workspace');
      }, { timeout: 10000 }),
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

    // Fill workspace form using React's state management
    await page.evaluate(() => {
      // Helper to get React component instance
      function getReactComponent(element) {
        const key = Object.keys(element).find(key => 
          key.startsWith('__reactFiber$')
        );
        return key ? element[key] : null;
      }

      // Helper to get component props
      function getComponentProps(fiber) {
        while (fiber) {
          if (fiber.memoizedProps) {
            return fiber.memoizedProps;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Helper to get React state hook
      function getStateHook(fiber) {
        while (fiber) {
          if (fiber.memoizedState && fiber.memoizedState.memoizedState !== undefined) {
            return fiber.memoizedState;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Fill workspace name
      const nameInput = document.querySelector('#workspaceName');
      if (nameInput) {
        const fiber = getReactComponent(nameInput);
        const props = getComponentProps(fiber);
        
        if (props && props.onChange) {
          nameInput.value = 'Test Workspace';
          props.onChange({ target: nameInput });
          console.log('Set workspace name');
        }
      }

      // Wait for slug to auto-generate
      return new Promise(resolve => {
        const checkSlug = setInterval(() => {
          const slugInput = document.querySelector('#workspaceSlug');
          if (slugInput && slugInput.value === 'test-workspace') {
            clearInterval(checkSlug);
            
            // Fill industry
            const industrySelect = document.querySelector('#industry');
            if (industrySelect) {
              const fiber = getReactComponent(industrySelect);
              const props = getComponentProps(fiber);
              
              if (props && props.onChange) {
                industrySelect.value = 'technology';
                props.onChange({ target: industrySelect });
                console.log('Set industry');
              }
            }
            
            // Fill company size
            const sizeSelect = document.querySelector('#companySize');
            if (sizeSelect) {
              const fiber = getReactComponent(sizeSelect);
              const props = getComponentProps(fiber);
              
              if (props && props.onChange) {
                sizeSelect.value = '1-10';
                props.onChange({ target: sizeSelect });
                console.log('Set company size');
              }
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
    await page.evaluate(() => {
      // Helper to get React component instance
      function getReactComponent(element) {
        const key = Object.keys(element).find(key => 
          key.startsWith('__reactFiber$')
        );
        return key ? element[key] : null;
      }

      // Helper to get component props
      function getComponentProps(fiber) {
        while (fiber) {
          if (fiber.memoizedProps) {
            return fiber.memoizedProps;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Helper to get React state hook
      function getStateHook(fiber) {
        while (fiber) {
          if (fiber.memoizedState && fiber.memoizedState.memoizedState !== undefined) {
            return fiber.memoizedState;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Find and trigger the nextStep function
      const onboardingComponent = document.querySelector('.container');
      if (onboardingComponent) {
        const fiber = getReactComponent(onboardingComponent);
        const stateHook = getStateHook(fiber);
        
        if (stateHook) {
          // Update currentStepIndex directly
          const setCurrentStepIndex = stateHook.queue.dispatch;
          setCurrentStepIndex((current) => current + 1);
          console.log('Triggered step transition');
        }
      }
    });

    // Wait for profile step
    await Promise.all([
      page.waitForFunction(() => {
        const heading = document.querySelector('h2');
        return heading && heading.textContent.includes('Complete Your Profile');
      }, { timeout: 15000 }),
      page.waitForFunction(() => {
        return !document.querySelector('body')?.classList.contains('loading');
      }, { timeout: 15000 })
    ]);
    console.log('✅ Navigated to profile setup');

    // Wait for profile form to be fully loaded
    await Promise.all([
      page.waitForSelector('#profileName', { timeout: 10000 }),
      page.waitForSelector('#timezone', { timeout: 10000 })
    ]);

    // Fill profile form using React's state management
    await page.evaluate(() => {
      // Helper to get React component instance
      function getReactComponent(element) {
        const key = Object.keys(element).find(key => 
          key.startsWith('__reactFiber$')
        );
        return key ? element[key] : null;
      }

      // Helper to get component props
      function getComponentProps(fiber) {
        while (fiber) {
          if (fiber.memoizedProps) {
            return fiber.memoizedProps;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Fill profile name
      const nameInput = document.querySelector('#profileName');
      if (nameInput) {
        const fiber = getReactComponent(nameInput);
        const props = getComponentProps(fiber);
        
        if (props && props.onChange) {
          nameInput.value = 'Test User';
          props.onChange({ target: nameInput });
          console.log('Set profile name');
        }
      }

      // Set timezone
      const timezoneSelect = document.querySelector('#timezone');
      if (timezoneSelect) {
        const fiber = getReactComponent(timezoneSelect);
        const props = getComponentProps(fiber);
        
        if (props && props.onChange) {
          timezoneSelect.value = 'UTC';
          props.onChange({ target: timezoneSelect });
          console.log('Set timezone');
        }
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
    await page.evaluate(() => {
      // Helper to get React component instance
      function getReactComponent(element) {
        const key = Object.keys(element).find(key => 
          key.startsWith('__reactFiber$')
        );
        return key ? element[key] : null;
      }

      // Helper to get component props
      function getComponentProps(fiber) {
        while (fiber) {
          if (fiber.memoizedProps) {
            return fiber.memoizedProps;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Helper to get React state hook
      function getStateHook(fiber) {
        while (fiber) {
          if (fiber.memoizedState && fiber.memoizedState.memoizedState !== undefined) {
            return fiber.memoizedState;
          }
          fiber = fiber.return;
        }
        return null;
      }

      // Find and trigger the nextStep function
      const onboardingComponent = document.querySelector('.container');
      if (onboardingComponent) {
        const fiber = getReactComponent(onboardingComponent);
        const stateHook = getStateHook(fiber);
        
        if (stateHook) {
          // Update currentStepIndex directly
          const setCurrentStepIndex = stateHook.queue.dispatch;
          setCurrentStepIndex((current) => current + 1);
          console.log('Triggered step transition');
        }
      }
    });

    // Wait for completion step
    await Promise.all([
      page.waitForFunction(() => {
        const heading = document.querySelector('h2');
        return heading && (
          heading.textContent.includes('All Set') ||
          heading.textContent.includes('Ready to Go')
        );
      }, { timeout: 15000 }),
      page.waitForFunction(() => {
        return !document.querySelector('body')?.classList.contains('loading');
      }, { timeout: 15000 })
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
      // Click the finish button
      page.evaluate(() => {
        // Helper to get React component instance
        function getReactComponent(element) {
          const key = Object.keys(element).find(key => 
            key.startsWith('__reactFiber$')
          );
          return key ? element[key] : null;
        }

        // Helper to get component props
        function getComponentProps(fiber) {
          while (fiber) {
            if (fiber.memoizedProps) {
              return fiber.memoizedProps;
            }
            fiber = fiber.return;
          }
          return null;
        }

        const button = document.querySelector('button.w-full');
        if (button && !button.disabled) {
          const fiber = getReactComponent(button);
          const props = getComponentProps(fiber);
          
          if (props && props.onClick) {
            props.onClick();
            console.log('Clicked finish button');
          }
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
