import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { GraduationCap, Loader2, Mail, Lock, User2 } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const navigate = useNavigate();
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    handleForgotPassword,
    auth,
  } = useContext(AuthContext);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Auth page - authenticated:", auth?.authenticate);
    console.log("Auth page - user role:", auth?.user?.role);
    console.log("Auth page - full user object:", auth?.user);
    
    if (auth?.authenticate) {
      if (auth?.user?.role === "superadmin") {
        console.log("Redirecting to admin dashboard");
        navigate("/admin", { replace: true });
      } else if (auth?.user?.role === "instructor") {
        console.log("Redirecting to instructor dashboard");
        navigate("/instructor", { replace: true });
      } else {
        console.log("Redirecting to student home");
        navigate("/home", { replace: true });
      }
    }
  }, [auth?.authenticate, auth?.user?.role, navigate]);

  function handleTabChange(value) {
    setActiveTab(value);
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== ""
    );
  }

  async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) return;

    setSendingEmail(true);
    const result = await handleForgotPassword(forgotPasswordEmail.trim());
    setSendingEmail(false);

    if (result.success) {
      setForgotPasswordEmail("");
      setTimeout(() => {
        setForgotPasswordOpen(false);
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 opacity-25 animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-20" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-fuchsia-500 blur-3xl opacity-20" />
      </div>

      <header className="px-6 lg:px-10 h-16 flex items-center justify-between backdrop-blur-md/30">
        <Link to={"/"} className="flex items-center">
          <GraduationCap className="h-8 w-8 mr-3 text-indigo-600" />
          <span className="font-extrabold text-xl tracking-tight">StudySync</span>
        </Link>
        <span className="hidden md:block text-sm text-muted-foreground">Collaborate, learn, and grow together</span>
      </header>

      <main className="px-6 py-10 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left hero/branding */}
          <div className="hidden lg:block">
            <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-3xl p-8 border shadow-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 border text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Trusted by students worldwide
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mt-4">Welcome to StudySync</h1>
              <p className="mt-3 text-muted-foreground">Your modern portal for online study and collaboration.</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-3"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600"><User2 className="w-4 h-4" /></span><span><strong>Personalized</strong> dashboards for students and instructors</span></li>
                <li className="flex items-center gap-3"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-600"><Lock className="w-4 h-4" /></span><span><strong>Secure</strong> authentication and password recovery</span></li>
                <li className="flex items-center gap-3"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-100 text-fuchsia-600"><GraduationCap className="w-4 h-4" /></span><span><strong>Engaging</strong> courses with group study tools</span></li>
              </ul>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-gradient-to-b from-white/60 to-white/30 dark:from-neutral-800/60 dark:to-neutral-800/30 border">
                  <div className="text-2xl font-bold">10k+</div>
                  <div className="text-xs text-muted-foreground">Active learners</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-b from-white/60 to-white/30 dark:from-neutral-800/60 dark:to-neutral-800/30 border">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs text-muted-foreground">Expert instructors</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-b from-white/60 to-white/30 dark:from-neutral-800/60 dark:to-neutral-800/30 border">
                  <div className="text-2xl font-bold">1k+</div>
                  <div className="text-xs text-muted-foreground">Courses available</div>
                </div>
              </div>
              <div className="mt-6 text-xs text-muted-foreground">
                "The clean UI makes studying enjoyable." — A happy learner
              </div>
            </div>
          </div>

          {/* Right auth card */}
          <div>
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-3xl border shadow-2xl ring-1 ring-black/5">
              <div className="p-2">
                <Tabs value={activeTab} defaultValue="signin" onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <Card className="p-6 space-y-4 bg-transparent shadow-none border-0">
                      <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to continue.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CommonForm
                          formControls={signInFormControls}
                          buttonText={"Sign In"}
                          formData={signInFormData}
                          setFormData={setSignInFormData}
                          isButtonDisabled={!checkIfSignInFormIsValid()}
                          handleSubmit={handleLoginUser}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">By continuing, you agree to our Terms & Privacy Policy.</p>
                          <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                            <DialogTrigger asChild>
                              <button type="button" className="text-sm text-primary underline hover:no-underline">Forgot password?</button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Mail className="h-5 w-5" />
                                  Reset Password
                                </DialogTitle>
                                <DialogDescription>
                                  Enter your email address and we'll send you a link to reset your password.
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="forgot-email">Email Address</Label>
                                  <Input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    required
                                    disabled={sendingEmail}
                                  />
                                </div>
                                <Button type="submit" className="w-full" disabled={sendingEmail}>
                                  {sendingEmail ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    "Send Reset Link"
                                  )}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="signup">
                    <Card className="p-6 space-y-4 bg-transparent shadow-none border-0">
                      <CardHeader>
                        <CardTitle>Create your account</CardTitle>
                        <CardDescription>Join StudySync and start learning today.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CommonForm
                          formControls={signUpFormControls}
                          buttonText={"Sign Up"}
                          formData={signUpFormData}
                          setFormData={setSignUpFormData}
                          isButtonDisabled={!checkIfSignUpFormIsValid()}
                          handleSubmit={handleRegisterUser}
                        />
                        <p className="text-xs text-muted-foreground">We’ll send a confirmation email to verify your account.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 lg:px-10 py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} StudySync. All rights reserved.
      </footer>
    </div>
  );
}

export default AuthPage;
