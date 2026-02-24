import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Key, RefreshCcw, Timer } from "lucide-react";

const SecureAccess = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [passkey, setPasskey] = useState("");
  const [enteredPasskey, setEnteredPasskey] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  // Load latest passkey on mount
  useEffect(() => {
    fetchLatestPasskey();

    // Check if session exists
    // This logic is now handled by the parent component via onSuccess or by the navigate fallback
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) setPasskey(""); // Clear passkey on expiry
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchLatestPasskey = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("admin_passkeys")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const expiry = new Date(data.expires_at).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((expiry - now) / 1000);

        if (diff > 0) {
          setPasskey(data.passkey);
          setTimeLeft(diff);
        } else {
          setPasskey("");
          setTimeLeft(0);
        }
      }
    } catch (err) {
      console.error("Error fetching passkey:", err);
    }
  };

  const generatePasskey = async () => {
    if (isLocked) {
      toast({
        title: "Access Locked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Delete old keys
      await (supabase as any).from("admin_passkeys").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // 2. Generate new key
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let newKey = "";
      for (let i = 0; i < 5; i++) {
        newKey += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

      const { error } = await (supabase as any).from("admin_passkeys").insert([
        { passkey: newKey, expires_at: expiresAt }
      ]);

      if (error) throw error;

      // We DON'T set the state here because we want to hide the key from the user
      // setPasskey(newKey);
      // setTimeLeft(120);

      toast({
        title: "Passkey Generated",
        description: "Request Sent. Please contact Admin for the access key.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;

    setIsVerifying(true);
    try {
      // Fetch latest key to be sure
      const { data, error } = await (supabase as any)
        .from("admin_passkeys")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        throw new Error("No active passkey found.");
      }

      const expiry = new Date(data.expires_at).getTime();
      const now = new Date().getTime();

      if (now > expiry) {
        toast({
          title: "Passkey Expired",
          description: "Please generate a new one.",
          variant: "destructive",
        });
        setPasskey("");
        setTimeLeft(0);
        return;
      }

      if (enteredPasskey.toUpperCase() === data.passkey) {
        toast({
          title: "Access Granted",
          description: "Verification successful.",
        });
        // Set session for 10 hours
        const expiresAt = Date.now() + 10 * 60 * 60 * 1000;
        localStorage.setItem("user_passkey_session", JSON.stringify({
          active: true,
          expiresAt,
          startTime: Date.now()
        }));

        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          setIsLocked(true);
          toast({
            title: "Security Lockout",
            description: "Too many failed attempts. Refresh page to reset.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invalid Passkey",
            description: `Remaining attempts: ${5 - newAttempts}`,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0] p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Quotation Maker - Secure Access</CardTitle>
            <CardDescription className="text-slate-500">
              Verify your identity to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex flex-col gap-4">
              <Button
                onClick={generatePasskey}
                variant="outline"
                className="w-full h-12 border-primary/20 hover:bg-primary/5 text-primary font-medium transition-all"
                disabled={isLoading || isLocked}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                Generate Pass Key
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-medium">Verification</span>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passkey" className="text-slate-700 font-medium">Enter Pass Key</Label>
                  <Input
                    id="passkey"
                    type="text"
                    value={enteredPasskey}
                    onChange={(e) => setEnteredPasskey(e.target.value.toUpperCase())}
                    placeholder="E.g. 4FD6E"
                    className="h-12 text-center text-xl tracking-[0.5em] font-bold border-slate-300 focus:border-primary focus:ring-primary"
                    maxLength={5}
                    required
                    disabled={isLocked}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={isVerifying || isLocked || enteredPasskey.length < 5}
                >
                  {isVerifying ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : "Verify & Login"}
                </Button>
              </form>
            </div>

            {isLocked && (
              <p className="text-center text-sm font-medium text-red-600 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Security Lockout - Too many attempts
              </p>
            )}

            <div className="text-center border-t border-slate-100 pt-4">
              <button
                onClick={() => navigate("/admin/login")}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Key className="w-3.5 h-3.5" />
                Login as Admin
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-xs font-medium">
          © 2026 Quotation Maker • Secure Portal
        </p>
      </div>
    </div>
  );
};

export default SecureAccess;
