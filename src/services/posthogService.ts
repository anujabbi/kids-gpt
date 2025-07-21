import posthog from 'posthog-js';
import { supabase } from '@/integrations/supabase/client';

let isInitialized = false;

const getPostHogConfig = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-posthog-config');
    
    if (error) {
      console.error('Error fetching PostHog config:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error invoking PostHog config function:', error);
    return null;
  }
};

export const initializePostHog = async () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    const config = await getPostHogConfig();
    
    if (!config?.apiKey) {
      console.warn('PostHog API key not available, analytics disabled');
      return;
    }

    posthog.init(config.apiKey, {
      api_host: config.host || 'https://app.posthog.com',
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
