#!/usr/bin/env node

const puppeteer = require('puppeteer');

// Mock auth token that will be accepted by the app
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQxNDkxNjAwLCJzdWIiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsInNlc3Npb25faWQiOiJ0ZXN0LXNlc3Npb24ifQ.8K2UjYrXyKYnpgaKJP9kE6O1pJYsSF_7JUkFpRh-Pds';

async function testOnboardingFlow() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Enable console logging
    page.on('console', msg => console.log('Browser:', msg.text()));

    // Set up mock auth state
    await page.goto('http://localhost:3009', {
      waitUntil: 'networkidle0'
    });

    await page.evaluate(({ token }) => {
      window.localStorage.setItem('supabase.url', 'http://localhost:54321');
      window.localStorage.setItem('supabase.key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE3OTgsImV4cCI6MjA2MjY2Nzc5OH0.aPQx_MYNjsFfBIZVAeN9yTqLkxHZVMkRPLxp-T7zYqU');
      window.localStorage.setItem('sb-access-token', token);
      window.localStorage.setItem('mt_session', token);
      window.localStorage.setItem('sb-refresh-token', token);
      window.localStorage.setItem('sb-provider-token', token);
    }, { token: mockToken });

    // Set auth cookies
    await page.setCookie({
      name: 'sb-access-token',
      value: mockToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });

    // Navigate to onboarding
    await page.goto('http://localhost:3009/onboarding', {
      waitUntil: 'networkidle0'
    });
    console.log('📍 Navigated to onboarding');

    // Wait for onboarding page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    console.log('✅ Onboarding page loaded');

    // Step 1: Welcome - Wait for cards to be visible
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Wait for cards to be interactive
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      return cards.length === 2 && 
             !cards[0].hasAttribute('disabled') && 
             !cards[1].hasAttribute('disabled');
    }, { timeout: 10000 });

    // Click the first card and wait for React state update
    await page.evaluate(() => {
      // Add a global variable to track state updates
      window.__onboardingStateUpdated = false;
      
      // Create a MutationObserver to watch for class changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const card = mutation.target;
            if (card.classList.contains('ring-2') && card.classList.contains('ring-blue-500')) {
              window.__onboardingStateUpdated = true;
            }
          }
        });
      });

      // Find and click the card
      const cards = Array.from(document.querySelectorAll('.cursor-pointer'));
      const createCard = cards.find(card => 
        card.textContent.includes('Create New') || 
        card.textContent.includes('Start fresh')
      );
      
      if (createCard) {
        // Start observing the card
        observer.observe(createCard, { attributes: true });
        
        // Click the card
        createCard.click();
        console.log('Clicked card:', createCard.textContent);
      } else {
        console.log('Card not found');
      }
    });

    // Wait for the state update to be reflected in the UI
    await page.waitForFunction(() => {
      return window.__onboardingStateUpdated === true;
    }, { timeout: 10000 });
    console.log('✅ Selected Create New Workspace');

    // Wait for continue button to be enabled
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full.max-w-xs');
      const isEnabled = button && !button.disabled;
      console.log('Button enabled state:', isEnabled);
      return isEnabled;
    }, { timeout: 10000 });

    // Add state tracking for button click and loading
    await page.evaluate(() => {
      window.__buttonClicked = false;
      window.__nextStepLoaded = false;
      
      // Create a MutationObserver to watch for form appearance
      const observer = new MutationObserver((mutations) => {
        const workspaceForm = document.querySelector('#workspaceName');
        if (workspaceForm && window.getComputedStyle(workspaceForm).display !== 'none') {
          window.__nextStepLoaded = true;
          observer.disconnect();
        }
      });
      
      // Start observing the document
      observer.observe(document.body, { 
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Click the button
      const button = document.querySelector('button.w-full.max-w-xs');
      if (button && !button.disabled) {
        button.click();
        window.__buttonClicked = true;
        console.log('Clicked continue button');
      }
    });

    // Wait for loading state
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full.max-w-xs');
      return button && button.disabled;
    }, { timeout: 10000 });

    // Wait for both the click and the next step to load
    await page.waitForFunction(() => {
      const workspaceForm = document.querySelector('#workspaceName');
      const isVisible = workspaceForm && window.getComputedStyle(workspaceForm).display !== 'none';
      console.log('Workspace form visible:', isVisible);
      return isVisible;
    }, { timeout: 10000 });
    console.log('✅ Clicked continue after workspace selection');

    // Fill out workspace form
    await page.type('#workspaceName', 'Test Workspace');
    await page.waitForFunction(() => {
      const slugInput = document.querySelector('#workspaceSlug');
      return slugInput && slugInput.value === 'test-workspace';
    }, { timeout: 10000 });

    await page.select('#industry', 'technology');
    await page.select('#companySize', '1-10');

    // Wait for form validation
    await page.waitForFunction(() => {
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      const nameInput = document.querySelector('#workspaceName');
      const slugInput = document.querySelector('#workspaceSlug');
      const industrySelect = document.querySelector('#industry');
      const sizeSelect = document.querySelector('#companySize');
      
      return button && !button.disabled &&
             nameInput && nameInput.value === 'Test Workspace' &&
             slugInput && slugInput.value === 'test-workspace' &&
             industrySelect && industrySelect.value === 'technology' &&
             sizeSelect && sizeSelect.value === '1-10';
    }, { timeout: 10000 });

    // Add state tracking for workspace form submission
    await page.evaluate(() => {
      window.__workspaceSubmitted = false;
      window.__profileFormLoaded = false;
      
      // Create a MutationObserver to watch for profile form appearance
      const observer = new MutationObserver((mutations) => {
        const profileForm = document.querySelector('#profileName');
        if (profileForm && window.getComputedStyle(profileForm).display !== 'none') {
          window.__profileFormLoaded = true;
          observer.disconnect();
        }
      });
      
      // Start observing the document
      observer.observe(document.body, { 
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Click the button
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      if (button && !button.disabled) {
        button.click();
        window.__workspaceSubmitted = true;
        console.log('Clicked create workspace button');
      }
    });

    // Wait for loading state
    await page.waitForFunction(() => {
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      return button && button.disabled;
    }, { timeout: 10000 });

    // Wait for profile form to load
    await page.waitForFunction(() => {
      const profileForm = document.querySelector('#profileName');
      const isVisible = profileForm && window.getComputedStyle(profileForm).display !== 'none';
      console.log('Profile form visible:', isVisible);
      return isVisible;
    }, { timeout: 15000 });
    console.log('✅ Submitted workspace form');

    // Fill profile form
    await page.type('#profileName', 'Test User');
    await page.select('#timezone', 'UTC');

    // Wait for form validation
    await page.waitForFunction(() => {
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      const nameInput = document.querySelector('#profileName');
      const timezoneSelect = document.querySelector('#timezone');
      
      return button && !button.disabled &&
             nameInput && nameInput.value === 'Test User' &&
             timezoneSelect && timezoneSelect.value === 'UTC';
    }, { timeout: 10000 });

    // Add state tracking for profile form submission
    await page.evaluate(() => {
      window.__profileSubmitted = false;
      window.__completionLoaded = false;
      
      // Create a MutationObserver to watch for completion step appearance
      const observer = new MutationObserver((mutations) => {
        const heading = Array.from(document.querySelectorAll('h2')).find(h => 
          h.textContent.includes('Ready to Go') || 
          h.textContent.includes('All Set')
        );
        if (heading && window.getComputedStyle(heading).display !== 'none') {
          window.__completionLoaded = true;
          observer.disconnect();
        }
      });
      
      // Start observing the document
      observer.observe(document.body, { 
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Click the button
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      if (button && !button.disabled) {
        button.click();
        window.__profileSubmitted = true;
        console.log('Clicked submit profile button');
      }
    });

    // Wait for loading state
    await page.waitForFunction(() => {
      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      return button && button.disabled;
    }, { timeout: 10000 });

    // Wait for completion step to load
    await page.waitForFunction(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(h => 
        h.textContent.includes('Ready to Go') || 
        h.textContent.includes('All Set')
      );
      const isVisible = heading && window.getComputedStyle(heading).display !== 'none';
      console.log('Completion step visible:', isVisible);
      return isVisible;
    }, { timeout: 15000 });
    console.log('✅ Submitted profile form');

    // Wait for finish button
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full');
      return button && 
             window.getComputedStyle(button).display !== 'none' &&
             !button.disabled;
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
