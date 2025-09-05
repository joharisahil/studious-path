// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { GraduationCap } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useRegisterMutation } from '@/store/api/authApi';
// import { loginSuccess } from '@/store/slices/authSlice';
// import { UserRole, RegisterData } from '@/types';

// export const RegisterForm = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [register, { isLoading }] = useRegisterMutation();

//   const [formData, setFormData] = useState<RegisterData>({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'admin' as UserRole,
//   });

//   const [passwordMessage, setPasswordMessage] = useState<string>("");
//   const [isPasswordMatch, setIsPasswordMatch] = useState<boolean | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       setPasswordMessage("Passwords do not match");
//       setIsPasswordMatch(false);
//       return;
//     }

//     try {
//       const result = await register(formData).unwrap();

//       dispatch(
//         loginSuccess({
//           user: result.data.user,
//           token: result.data.token,
//         })
//       );

//       const dashboardRoutes = {
//         admin: '/dashboard/admin',
//         teacher: '/dashboard/teacher',
//         student: '/dashboard/student',
//         parent: '/dashboard/parent',
//       };

//       navigate(dashboardRoutes[result.data.user.role]);
//     } catch (error: any) {
//       // Handle API error
//     }
//   };

//   const handleConfirmPasswordChange = (value: string) => {
//     setFormData((prev) => ({ ...prev, confirmPassword: value }));

//     if (!formData.password) return;

//     if (formData.password === value) {
//       setPasswordMessage(" Passwords match");
//       setIsPasswordMatch(true);
//     } else {
//       setPasswordMessage(" Passwords do not match");
//       setIsPasswordMatch(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md gradient-card border-0 shadow-xl">
//         <CardHeader className="text-center">
//           <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
//             <GraduationCap className="w-8 h-8 text-primary-foreground" />
//           </div>
//           <CardTitle className="text-2xl font-bold text-gradient-primary">
//             EduManage Pro
//           </CardTitle>
//           <CardDescription className="text-muted-foreground">
//             Create a new account
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Role Selection */}
//             <div className="space-y-2">
//               <Label htmlFor="role">Select Role</Label>
//               <Select
//                 value={formData.role}
//                 onValueChange={(role: UserRole) =>
//                   setFormData((prev) => ({ ...prev, role }))
//                 }
//               >
//                 <SelectTrigger className="focus-visible-ring">
//                   <SelectValue placeholder="Administrator" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="admin">Administrator</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Email */}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email Address</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, email: e.target.value }))
//                 }
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, password: e.target.value }))
//                 }
//                 required
//               />
//             </div>

//             {/* Confirm Password */}
//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Confirm Password</Label>
//               <Input
//                 id="confirmPassword"
//                 type="password"
//                 placeholder="Re-enter your password"
//                 value={formData.confirmPassword}
//                 onChange={(e) => handleConfirmPasswordChange(e.target.value)}
//                 required
//               />
//               {passwordMessage && (
//                 <p
//                   className={`text-sm ${
//                     isPasswordMatch ? "text-green-500" : "text-red-500"
//                   }`}
//                 >
//                   {passwordMessage}
//                 </p>
//               )}
//             </div>

//             {/* Register Button */}
//             <Button
//               type="submit"
//               className="w-full gradient-primary hover:scale-[1.02] transition-transform"
//               disabled={isLoading}
//             >
//               {isLoading ? 'Registering...' : 'Register'}
//             </Button>
//           </form>

//           {/* Login Link */}
//           <div className="text-center">
//             <p className="text-sm text-muted-foreground">
//               Already have an account?{' '}
//               <Link
//                 to="/login"
//                 className="font-medium text-primary hover:text-primary-hover transition-colors"
//               >
//                 Login here
//               </Link>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterMutation } from '@/store/api/authApi';
import { loginSuccess } from '@/store/slices/authSlice';
import { UserRole, RegisterData } from '@/types';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as UserRole,
  });

  const [passwordMessage, setPasswordMessage] = useState<string>('');
  const [isPasswordMatch, setIsPasswordMatch] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordMessage('Passwords do not match');
      setIsPasswordMatch(false);
      return;
    }

    try {
      setApiError(null);

      // 🔹 API Call via RTK Query
      const result = await register(formData).unwrap();

      // 🔹 Save user + token in Redux
      dispatch(
        loginSuccess({
          user: result.data.user,
          token: result.data.token,
        })
      );

      // 🔹 Navigate based on role
      const dashboardRoutes: Record<UserRole, string> = {
        admin: '/dashboard/admin',
        teacher: '/dashboard/teacher',
        student: '/dashboard/student',
        parent: '/dashboard/parent',
      };

      navigate(dashboardRoutes[result.data.user.role]);
    } catch (error: any) {
      // 🔹 Handle API error
      setApiError(error?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword: value }));

    if (!formData.password) return;

    if (formData.password === value) {
      setPasswordMessage('Passwords match');
      setIsPasswordMatch(true);
    } else {
      setPasswordMessage('Passwords do not match');
      setIsPasswordMatch(false);
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
                  <SelectValue placeholder="Administrator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  {/* <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* First Name */}
            {/* <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                required
              />
            </div> */}

            {/* Last Name */}
            {/* <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
              />
            </div> */}

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
                    isPasswordMatch ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {passwordMessage}
                </p>
              )}
            </div>

            {/* API Error Message */}
            {apiError && (
              <p className="text-sm text-red-500 text-center">{apiError}</p>
            )}

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full gradient-primary hover:scale-[1.02] transition-transform"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
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

