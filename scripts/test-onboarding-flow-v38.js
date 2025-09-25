#!/usr/bin/env node

const puppeteer = require('puppeteer');

// Mock auth token that will be accepted by the app
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQxNDkxNjAwLCJzdWIiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsInNlc3Npb25faWQiOiJ0ZXN0LXNlc3Npb24ifQ.8K2UjYrXyKYnpgaKJP9kE6O1pJYsSF_7JUkFpRh-Pds';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
      window.__cardClicked = false;
      window.__cardSelected = false;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const card = mutation.target;
            if (card.classList.contains('ring-2') && card.classList.contains('ring-blue-500')) {
              window.__cardSelected = true;
            }
          }
        });
      });

      const cards = Array.from(document.querySelectorAll('.cursor-pointer'));
      const createCard = cards.find(card => 
        card.textContent.includes('Create New') || 
        card.textContent.includes('Start fresh')
      );
      
      if (createCard) {
        observer.observe(createCard, { attributes: true });
        createCard.click();
        window.__cardClicked = true;
        console.log('Clicked card:', createCard.textContent);
      }
    });
    
    // Wait for card selection to be reflected in UI
    await page.waitForFunction(() => {
      return window.__cardClicked && window.__cardSelected;
    }, { timeout: 10000 });
    console.log('✅ Selected Create New Workspace');

    // Wait for continue button to be enabled
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full.max-w-xs');
      const isEnabled = button && !button.disabled;
      console.log('Button enabled state:', isEnabled);
      return isEnabled;
    }, { timeout: 10000 });

    // Set up state tracking for step transition
    await page.evaluate(() => {
      window.__buttonClicked = false;
      window.__stepTransitioned = false;

      const observer = new MutationObserver((mutations) => {
        const workspaceForm = document.querySelector('#workspaceName');
        const heading = document.querySelector('h2');
        if (workspaceForm && heading && heading.textContent.includes('Create Your Workspace')) {
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

    // Set up state tracking for workspace form submission
    await page.evaluate(() => {
      window.__workspaceSubmitted = false;
      window.__profileStepLoaded = false;

      const observer = new MutationObserver((mutations) => {
        const profileForm = document.querySelector('#profileName');
        const heading = document.querySelector('h2');
        if (profileForm && heading && heading.textContent.includes('Set Up Your Profile')) {
          window.__profileStepLoaded = true;
          observer.disconnect();
        }
      });

      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
      });

      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      if (button && !button.disabled) {
        button.click();
        window.__workspaceSubmitted = true;
        console.log('Clicked create workspace button');
      }
    });

    // Wait for step transition
    await page.waitForFunction(() => {
      return window.__workspaceSubmitted && window.__profileStepLoaded;
    }, { timeout: 15000 });
    console.log('✅ Navigated to profile setup');

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

    // Set up state tracking for profile form submission
    await page.evaluate(() => {
      window.__profileSubmitted = false;
      window.__completionLoaded = false;

      const observer = new MutationObserver((mutations) => {
        const heading = document.querySelector('h2');
        if (heading && (heading.textContent.includes('Ready to Go') || heading.textContent.includes('All Set'))) {
          window.__completionLoaded = true;
          observer.disconnect();
        }
      });

      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
      });

      const button = document.querySelector('button.flex-1:not([variant="outline"])');
      if (button && !button.disabled) {
        button.click();
        window.__profileSubmitted = true;
        console.log('Clicked submit profile button');
      }
    });

    // Wait for step transition
    await page.waitForFunction(() => {
      return window.__profileSubmitted && window.__completionLoaded;
    }, { timeout: 15000 });
    console.log('✅ Navigated to completion step');

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
