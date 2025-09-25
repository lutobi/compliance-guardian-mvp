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

    // Click the first card using text content
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.cursor-pointer'));
      const createCard = cards.find(card => 
        card.textContent.includes('Create New') || 
        card.textContent.includes('Start fresh')
      );
      if (createCard) {
        // Force React state update
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        createCard.dispatchEvent(clickEvent);
      }
    });
    
    // Wait for card selection to be reflected in React state
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      const createCard = Array.from(cards).find(card => 
        card.textContent.includes('Create New') || 
        card.textContent.includes('Start fresh')
      );
      const button = document.querySelector('button');
      return createCard && 
             createCard.classList.contains('ring-2') && 
             createCard.classList.contains('ring-blue-500') &&
             button && !button.disabled;
    }, { timeout: 10000 });
    console.log('✅ Selected Create New Workspace');

    // Click continue and wait for state update
    await Promise.all([
      page.waitForFunction(() => {
        const badge = document.querySelector('span.bg-secondary');
        const dots = document.querySelectorAll('.rounded-full');
        return badge && 
               badge.textContent.includes('Step 2') &&
               dots[1].classList.contains('bg-blue-500');
      }, { timeout: 10000 }),
      page.evaluate(() => {
        const button = document.querySelector('button');
        if (button && !button.disabled) {
          // Force React state update
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          button.dispatchEvent(clickEvent);
        }
      })
    ]);
    console.log('✅ Clicked continue after workspace selection');

    // Step 2: Workspace Setup - Wait for form to load
    await page.waitForFunction(() => {
      const form = document.querySelector('#workspaceName');
      const badge = document.querySelector('span.bg-secondary');
      return form && 
             window.getComputedStyle(form).display !== 'none' &&
             badge && badge.textContent.includes('Step 2');
    }, { timeout: 10000 });

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

    // Click Create Workspace and wait for state update
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/team/init'),
        { timeout: 15000 }
      ),
      page.waitForFunction(() => {
        const badge = document.querySelector('span.bg-secondary');
        const dots = document.querySelectorAll('.rounded-full');
        return badge && 
               badge.textContent.includes('Step 3') &&
               dots[2].classList.contains('bg-blue-500');
      }, { timeout: 15000 }),
      page.evaluate(() => {
        const button = document.querySelector('button.flex-1:not([variant="outline"])');
        if (button && !button.disabled) {
          // Force React state update
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          button.dispatchEvent(clickEvent);
        }
      })
    ]);
    console.log('✅ Submitted workspace form');

    // Step 3: Profile Setup - Wait for form
    await page.waitForFunction(() => {
      const form = document.querySelector('#profileName');
      const badge = document.querySelector('span.bg-secondary');
      return form && 
             window.getComputedStyle(form).display !== 'none' &&
             badge && badge.textContent.includes('Step 3');
    }, { timeout: 15000 });
    console.log('✅ Profile step loaded');

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

    // Submit profile and wait for state update
    await Promise.all([
      page.waitForFunction(() => {
        const badge = document.querySelector('span.bg-secondary');
        const dots = document.querySelectorAll('.rounded-full');
        return badge && 
               badge.textContent.includes('Step 4') &&
               dots[3].classList.contains('bg-blue-500');
      }, { timeout: 15000 }),
      page.evaluate(() => {
        const button = document.querySelector('button.flex-1:not([variant="outline"])');
        if (button && !button.disabled) {
          // Force React state update
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          button.dispatchEvent(clickEvent);
        }
      })
    ]);
    console.log('✅ Submitted profile form');

    // Step 4: Completion - Wait for finish button
    await page.waitForFunction(() => {
      const button = document.querySelector('button.w-full');
      const badge = document.querySelector('span.bg-secondary');
      return button && 
             window.getComputedStyle(button).display !== 'none' &&
             !button.disabled &&
             badge && badge.textContent.includes('Step 4');
    }, { timeout: 15000 });

    // Click finish and wait for redirect
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      page.evaluate(() => {
        const button = document.querySelector('button.w-full');
        if (button && !button.disabled) {
          // Force React state update
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          button.dispatchEvent(clickEvent);
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
