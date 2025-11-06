import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegisterAdminMutation } from "../../store/api/authApi";
import { RegisterData, UserRole } from "@/types";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerAdmin, { isLoading }] = useRegisterAdminMutation();

  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    schoolName: "",
    planDays: 0, // 👈 new field
  });

  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [isPasswordMatch, setIsPasswordMatch] = useState<boolean | null>(null);
  const [apiMessage, setApiMessage] = useState<string>("");

  // ✅ Confirm Password Validation
  const handleConfirmPasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword: value }));

    if (!formData.password) return;

    if (formData.password === value) {
      setPasswordMessage("Passwords match");
      setIsPasswordMatch(true);
    } else {
      setPasswordMessage("Passwords do not match");
      setIsPasswordMatch(false);
    }
  };

  // ✅ Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      !formData.schoolName ||
      !formData.planDays
    ) {
      setApiMessage("Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordMessage("Passwords do not match");
      setIsPasswordMatch(false);
      return;
    }

    try {
      const result = await registerAdmin({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        schoolName: formData.schoolName,
        planDays: Number(formData.planDays), // 👈 send as number
      }).unwrap();

      if (result.success) {
        setApiMessage(result.message);
        setTimeout(() => {
          navigate("/dashboard/admin");
        }, 1500);
      } else {
        setApiMessage(result.message || "Registration failed");
      }
    } catch (error: any) {
      setApiMessage(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md gradient-card border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-gradient-primary">
            EduManage Pro
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Create a new account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ✅ School Name */}
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Enter your school name"
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    schoolName: e.target.value,
                  }))
                }
                required
              />
            </div>

            {/* ✅ Plan Days */}
            <div className="space-y-2">
              <Label htmlFor="planDays">Plan Duration (in days)</Label>
              <Input
                id="planDays"
                type="number"
                placeholder="Enter number of days"
                value={formData.planDays === 0 ? "" : formData.planDays} // ✅ Show blank instead of 0
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    planDays: value === "" ? 0 : Number(value), // ✅ Don't force 0 while typing
                  }));
                }}
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select
                value={formData.role}
                onValueChange={(role: UserRole) =>
                  setFormData((prev) => ({ ...prev, role }))
                }
              >
                <SelectTrigger className="focus-visible-ring">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
              />
              {passwordMessage && (
                <p
                  className={`text-sm ${
                    isPasswordMatch ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordMessage}
                </p>
              )}
            </div>

            {/* API Response */}
            {apiMessage && (
              <p className="text-center text-sm text-red-500">{apiMessage}</p>
            )}

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full gradient-primary hover:scale-[1.02] transition-transform"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
