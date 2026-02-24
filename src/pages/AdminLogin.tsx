import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                localStorage.setItem("admin_login_session", "active_" + Date.now());
                toast({
                    title: "Welcome Back",
                    description: "Login successful.",
                });
                navigate("/admin/dashboard");
            }
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0] p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl border-t-4 border-t-primary">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-800">Admin Login</CardTitle>
                        <CardDescription className="text-slate-500">
                            Only authorized administrators can access this area
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Admin Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-lg font-semibold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </form>
                        <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-orange-600 mt-0.5" />
                            <p className="text-xs text-orange-800 leading-relaxed">
                                This is a restricted area. All access attempts are logged. If you are not an administrator, please return to the <a href="/" className="underline font-bold">Home Page</a>.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <p className="text-center mt-8 text-slate-400 text-xs font-medium">
                    © 2026 Venue Manager • Secure Admin Portal
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
