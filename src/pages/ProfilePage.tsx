import { useState, useEffect } from "react";
import AboutUs from "@/components/AboutUs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, User, Mail, FileText, Linkedin, Lock, Camera, Edit, Calendar, Star, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import BlockedUsers from "@/components/BlockedUsers";

interface ProfileData {
  full_name: string;
  email: string;
  bio: string;
  linkedin_url: string;
  avatar_url: string;
}

interface UserExperience {
  id: string;
  company: string;
  role: string;
  date: string;
  rounds: any;
  average_rating: number;
  rating_count: number;
  upvote_count: number;
  created_at: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [userExperiences, setUserExperiences] = useState<UserExperience[]>([]);
  const [hasBlockedUsers, setHasBlockedUsers] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    bio: "",
    linkedin_url: "",
    avatar_url: ""
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    if (activeTab === 'experiences') {
      fetchUserExperiences();
    }
  }, [user, navigate, activeTab]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          bio: data.bio || "",
          linkedin_url: data.linkedin_url || "",
          avatar_url: data.avatar_url || ""
        });
      } else {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || ""
          });

        if (createError) {
          console.error('Error creating profile:', createError);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const fetchUserExperiences = async () => {
    if (!user) return;

    setExperiencesLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserExperiences(data || []);
    } catch (error) {
      console.error('Error fetching user experiences:', error);
      toast({
        title: "Error",
        description: "Failed to load your experiences",
        variant: "destructive",
      });
    } finally {
      setExperiencesLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          bio: profile.bio,
          linkedin_url: profile.linkedin_url,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Update user_name in all interview posts to keep data consistent
      if (profile.full_name) {
        const { error: postsError } = await supabase
          .from('interview_posts')
          .update({ user_name: profile.full_name })
          .eq('user_id', user.id);

        if (postsError) {
          console.error('Error updating interview posts user name:', postsError);
        }
      }

      // Update email in auth if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        });
        
        if (emailError) {
          toast({
            title: "Warning",
            description: "Profile updated but email change requires verification",
            variant: "destructive",
          });
        }
      }

      // Refresh profile data
      await fetchProfile();

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));

      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => navigate(`/profile?tab=${value}`)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="experiences">My Experiences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Profile Settings</CardTitle>
                  <p className="text-muted-foreground">
                    Manage your personal information and account settings
                  </p>
                </CardHeader>
              </Card>

              {/* Avatar Upload */}
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url} alt="Profile picture" />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload Picture"}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile URL
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>

              <Button 
                onClick={handlePasswordChange} 
                disabled={loading || !passwords.newPassword || !passwords.confirmPassword}
                variant="outline"
                className="w-full"
              >
                {loading ? "Updating..." : "Change Password"}
              </Button>
            </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experiences" className="space-y-6">
              {/* Experiences Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    My Interview Experiences
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Manage and edit your shared interview experiences
                  </p>
                </CardHeader>
              </Card>

              {/* Experiences List */}
              <Card>
                <CardContent className="p-6">
                  {experiencesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Loading your experiences...</div>
                    </div>
                  ) : userExperiences.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No experiences yet</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't shared any interview experiences yet.
                      </p>
                      <Link to="/submit">
                        <Button>Share Your First Experience</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userExperiences.map((experience) => (
                        <Card key={experience.id} className="border border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{experience.company}</h3>
                                  <Badge variant="secondary">{experience.role}</Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(experience.date).toLocaleDateString()}
                                  </div>
                                  
                                  {experience.rating_count > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      {experience.average_rating.toFixed(1)} ({experience.rating_count} ratings)
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    {experience.upvote_count} upvotes
                                  </div>
                                </div>

                                <div className="text-sm text-muted-foreground">
                                  {Array.isArray(experience.rounds) ? experience.rounds.length : 0} interview round{Array.isArray(experience.rounds) && experience.rounds.length !== 1 ? 's' : ''}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link to={`/submit/${experience.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </Link>
                                <Link to={`/experience/${experience.id}`}>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blocked Users Management */}
              {userExperiences.length > 0 && hasBlockedUsers && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Blocked Users Management</CardTitle>
                    <p className="text-muted-foreground">
                      Manage users you've blocked from sending chat requests to your experiences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <BlockedUsers
                      experiences={userExperiences.map(exp => ({
                        id: exp.id,
                        company: exp.company,
                        role: exp.role
                      }))}
                      onBlockedUsersChange={setHasBlockedUsers}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Hidden BlockedUsers component to check for blocked users */}
              {userExperiences.length > 0 && !hasBlockedUsers && (
                <div style={{ display: 'none' }}>
                  <BlockedUsers
                    experiences={userExperiences.map(exp => ({
                      id: exp.id,
                      company: exp.company,
                      role: exp.role
                    }))}
                    onBlockedUsersChange={setHasBlockedUsers}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AboutUs />
    </div>
  );
};

export default ProfilePage;