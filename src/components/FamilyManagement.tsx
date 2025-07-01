
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Plus, Users, User, Eye, EyeOff, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FamilyMember {
  id: string;
  user_id: string;
  role: 'parent' | 'child';
  joined_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    age: number | null;
  } | null;
}

interface Family {
  id: string;
  name: string;
  family_code: string;
  created_at: string;
}

export function FamilyManagement() {
  const { profile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showFamilyCode, setShowFamilyCode] = useState(false);
  const [childName, setChildName] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [childAge, setChildAge] = useState('');
  const [addingChild, setAddingChild] = useState(false);
  
  // Age editing state
  const [editingAgeFor, setEditingAgeFor] = useState<string | null>(null);
  const [newAge, setNewAge] = useState('');
  const [updatingAge, setUpdatingAge] = useState(false);

  // Generate age options from 4 to 25
  const ageOptions = Array.from({ length: 22 }, (_, i) => i + 4);

  useEffect(() => {
    if (profile?.family_id) {
      fetchFamilyData();
    }
  }, [profile]);

  const fetchFamilyData = async () => {
    if (!profile?.family_id) return;
    
    try {
      // Fetch family info
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', profile.family_id)
        .single();

      if (familyError) throw familyError;
      setFamily(familyData);

      // Fetch family members
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            age
          )
        `)
        .eq('family_id', profile.family_id);

      if (membersError) throw membersError;
      setFamilyMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Failed to load family information');
    } finally {
      setLoading(false);
    }
  };

  const copyFamilyCode = () => {
    if (family?.family_code) {
      navigator.clipboard.writeText(family.family_code);
      toast.success('Family code copied to clipboard!');
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family || !childAge) return;

    setAddingChild(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: childEmail,
        password: childPassword,
        options: {
          data: {
            full_name: childName,
            role: 'child',
            family_code: family.family_code,
            age: parseInt(childAge)
          }
        }
      });

      if (error) throw error;
      
      toast.success('Child account created successfully!');
      setShowAddChild(false);
      setChildName('');
      setChildEmail('');
      setChildPassword('');
      setChildAge('');
      
      // Refresh family data
      setTimeout(() => {
        fetchFamilyData();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error adding child:', error);
      toast.error(error.message || 'Failed to create child account');
    } finally {
      setAddingChild(false);
    }
  };

  const handleEditAge = (userId: string, currentAge: number | null) => {
    setEditingAgeFor(userId);
    setNewAge(currentAge?.toString() || '');
  };

  const handleUpdateAge = async (userId: string) => {
    if (!newAge) return;

    setUpdatingAge(true);
    
    try {
      const { error } = await supabase.rpc('update_child_age', {
        child_user_id: userId,
        new_age: parseInt(newAge)
      });

      if (error) throw error;
      
      toast.success('Age updated successfully!');
      setEditingAgeFor(null);
      setNewAge('');
      fetchFamilyData(); // Refresh the data
      
    } catch (error: any) {
      console.error('Error updating age:', error);
      toast.error(error.message || 'Failed to update age');
    } finally {
      setUpdatingAge(false);
    }
  };

  const cancelEditAge = () => {
    setEditingAgeFor(null);
    setNewAge('');
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

  if (!family) {
    return (
      <Card>
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">No family information found.</p>
        </CardContent>
      </Card>
    );
  }

  const parents = familyMembers.filter(member => member.role === 'parent');
  const children = familyMembers.filter(member => member.role === 'child');

  return (
    <div className="space-y-6">
      {/* Family Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {family.name}
          </CardTitle>
          <CardDescription>
            Manage your family members and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Family Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-lg font-mono bg-background px-2 py-1 rounded">
                  {showFamilyCode ? family.family_code : '••••••'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFamilyCode(!showFamilyCode)}
                >
                  {showFamilyCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyFamilyCode}
                  disabled={!showFamilyCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with your children to join the family
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Family Members ({familyMembers.length})</CardTitle>
            <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Child Account</DialogTitle>
                  <DialogDescription>
                    Create a new account for your child. They will be able to use KidsGPT with parental oversight.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddChild} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-name">Child's Full Name</Label>
                    <Input
                      id="child-name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Enter child's name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-age">Age</Label>
                    <Select value={childAge} onValueChange={setChildAge} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageOptions.map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age} years old
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-email">Email Address</Label>
                    <Input
                      id="child-email"
                      type="email"
                      value={childEmail}
                      onChange={(e) => setChildEmail(e.target.value)}
                      placeholder="child@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-password">Password</Label>
                    <Input
                      id="child-password"
                      type="password"
                      value={childPassword}
                      onChange={(e) => setChildPassword(e.target.value)}
                      placeholder="Create a secure password"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddChild(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addingChild || !childAge}>
                      {addingChild ? 'Creating...' : 'Create Account'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Parents */}
            {parents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Parents</h4>
                <div className="space-y-2">
                  {parents.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{member.profiles?.full_name || 'Unnamed'}</p>
                          <p className="text-sm text-muted-foreground">{member.profiles?.email || 'No email'}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Parent</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Children</h4>
                <div className="space-y-2">
                  {children.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{member.profiles?.full_name || 'Unnamed'}</p>
                          <p className="text-sm text-muted-foreground">{member.profiles?.email || 'No email'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {editingAgeFor === member.user_id ? (
                              <div className="flex items-center gap-2">
                                <Select value={newAge} onValueChange={setNewAge}>
                                  <SelectTrigger className="w-32 h-7">
                                    <SelectValue placeholder="Select age" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ageOptions.map((age) => (
                                      <SelectItem key={age} value={age.toString()}>
                                        {age} years
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateAge(member.user_id)}
                                  disabled={updatingAge || !newAge}
                                  className="h-7"
                                >
                                  {updatingAge ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditAge}
                                  disabled={updatingAge}
                                  className="h-7"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Age: {member.profiles?.age || 'Not set'}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditAge(member.user_id, member.profiles?.age)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Child</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {children.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No children added yet</p>
                <p className="text-xs">Click "Add Child" to create a child account</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
