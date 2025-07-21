import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_API_KEY = 'phc_your_api_key_here'; // Replace with your actual PostHog API key
const POSTHOG_HOST = 'https://app.posthog.com'; // Or your self-hosted instance

let isInitialized = false;

export const initializePostHog = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      // Enable session recording
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      // Capture pageviews automatically
      capture_pageview: true,
      // Other useful options
      autocapture: true,
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded successfully');
        }
      },
    });
    isInitialized = true;
  }
};

// Analytics tracking functions
export const analytics = {
  // Track page views
  pageView: (path?: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview', {
        $current_url: path || window.location.href,
      });
    }
  },

  // Track custom events
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture(eventName, properties);
    }
  },

  // Identify users
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, traits);
    }
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.setPersonProperties(properties);
    }
  },

  // Reset user on logout
  reset: () => {
    if (typeof window !== 'undefined') {
      posthog.reset();
    }
  },

  // Group analytics (for family-based features)
  group: (groupType: string, groupKey: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.group(groupType, groupKey, properties);
    }
  },
};

export default posthog;
