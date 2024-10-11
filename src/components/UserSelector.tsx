import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { signUp, signIn, signOut } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserSelectorProps {
  onUserChange: (user: User | null) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ onUserChange }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPersistedUser();
  }, []);

  const checkPersistedUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        onUserChange(data);
      }
    }
  };

  const handleAddUser = async () => {
    if (newUsername.trim() && newPin.trim()) {
      try {
        const { user } = await signUp(newUsername.trim(), newPin.trim());
        if (user) {
          const newUser = { id: user.id, username: newUsername.trim(), pin: newPin.trim() };
          onUserChange(newUser);
          setNewUsername('');
          setNewPin('');
          setIsDialogOpen(false);
          toast({
            title: 'User Added',
            description: `${newUsername} has been added successfully.`,
          });
        }
      } catch (error) {
        console.error('Error adding user:', error);
        toast({
          title: 'Error',
          description: 'Failed to add user. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleLogin = async () => {
    try {
      const { user } = await signIn(loginUsername, loginPin);
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          onUserChange(data);
          setIsLoginDialogOpen(false);
          setLoginUsername('');
          setLoginPin('');
          toast({
            title: 'Logged In',
            description: `Welcome back, ${data.username}!`,
          });
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign In Error',
        description: 'Failed to sign in. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onUserChange(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign Out Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <Input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter username"
          />
          <Input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Enter PIN"
          />
          <Button onClick={handleAddUser}>Add User</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Login</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <Input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Enter username"
          />
          <Input
            type="password"
            value={loginPin}
            onChange={(e) => setLoginPin(e.target.value)}
            placeholder="Enter PIN"
          />
          <Button onClick={handleLogin}>Login</Button>
        </DialogContent>
      </Dialog>

      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default UserSelector;