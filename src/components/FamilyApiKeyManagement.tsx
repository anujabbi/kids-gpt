
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { familyApiKeyService } from '@/services/familyApiKeyService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function FamilyApiKeyManagement() {
  const { profile } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, [profile?.family_id]);

  const loadApiKeys = async () => {
    if (!profile?.family_id) return;

    setLoading(true);
    try {
      // Load OpenAI API key
      const familyApiKey = await familyApiKeyService.getFamilyApiKey(profile.family_id);
      setApiKey(familyApiKey || '');

      // Load Gemini API key
      const { data: family } = await supabase
        .from('families')
        .select('gemini_api_key')
        .eq('id', profile.family_id)
        .single();
      setGeminiApiKey(family?.gemini_api_key || '');
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!profile?.family_id) return;
    
    setSaving(true);
    try {
      const { error } = await familyApiKeyService.updateFamilyApiKey(profile.family_id, apiKey);
      if (error) {
        toast.error('Failed to save API key');
      } else {
        toast.success('Family API key saved successfully');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveApiKey = async () => {
    if (!profile?.family_id) return;

    setSaving(true);
    try {
      const { error } = await familyApiKeyService.removeFamilyApiKey(profile.family_id);
      if (error) {
        toast.error('Failed to remove API key');
      } else {
        setApiKey('');
        toast.success('Family API key removed successfully');
      }
    } catch (error) {
      console.error('Error removing API key:', error);
      toast.error('Failed to remove API key');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeminiApiKey = async () => {
    if (!profile?.family_id) return;

    setSavingGemini(true);
    try {
      const { error } = await supabase
        .from('families')
        .update({ gemini_api_key: geminiApiKey })
        .eq('id', profile.family_id);

      if (error) {
        toast.error('Failed to save Gemini API key');
      } else {
        toast.success('Gemini API key saved successfully');
      }
    } catch (error) {
      console.error('Error saving Gemini API key:', error);
      toast.error('Failed to save Gemini API key');
    } finally {
      setSavingGemini(false);
    }
  };

  const handleRemoveGeminiApiKey = async () => {
    if (!profile?.family_id) return;

    setSavingGemini(true);
    try {
      const { error } = await supabase
        .from('families')
        .update({ gemini_api_key: null })
        .eq('id', profile.family_id);

      if (error) {
        toast.error('Failed to remove Gemini API key');
      } else {
        setGeminiApiKey('');
        toast.success('Gemini API key removed successfully');
      }
    } catch (error) {
      console.error('Error removing Gemini API key:', error);
      toast.error('Failed to remove Gemini API key');
    } finally {
      setSavingGemini(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* OpenAI API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Family OpenAI API Key</CardTitle>
          <CardDescription>
            Set the API key that will be used by all family members for AI chat functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="family-api-key">OpenAI API Key</Label>
            <div className="relative">
              <Input
                id="family-api-key"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This API key will be used by all family members and stored securely in the family settings
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveApiKey}
              disabled={saving || !apiKey.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            {apiKey && (
              <Button
                variant="outline"
                onClick={handleRemoveApiKey}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gemini API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Family Gemini API Key</CardTitle>
          <CardDescription>
            Set the Google Gemini API key for comic character and panel generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="family-gemini-api-key">Gemini API Key</Label>
            <div className="relative">
              <Input
                id="family-gemini-api-key"
                type={showGeminiApiKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIza..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
              >
                {showGeminiApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
              . This key is used for comic image generation.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveGeminiApiKey}
              disabled={savingGemini || !geminiApiKey.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {savingGemini ? 'Saving...' : 'Save'}
            </Button>
            {geminiApiKey && (
              <Button
                variant="outline"
                onClick={handleRemoveGeminiApiKey}
                disabled={savingGemini}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
