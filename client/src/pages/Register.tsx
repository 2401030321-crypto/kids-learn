import { KidsCard } from "@/components/kids-card";
import { KidsButton } from "@/components/kids-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { Sparkles, Info } from "lucide-react";
import { useState } from "react";
import { registerUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser({ username, password, role });
      toast({
        title: "Account created!",
        description: "Now you can login with your credentials.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <KidsCard className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary">Join KidSpace</h1>
          <p className="text-muted-foreground">Start your learning journey today!</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              placeholder="Choose an explorer name" 
              className="rounded-xl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              <strong>Child accounts</strong> can only be created by parents from the Parent Dashboard after logging in. This keeps children safe!
            </p>
          </div>
          
          <KidsButton className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </KidsButton>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Login here
          </Link>
        </p>
      </KidsCard>
    </div>
  );
}
