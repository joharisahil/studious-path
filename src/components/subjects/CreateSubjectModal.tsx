// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { useCreateSubjectMutation } from '@/store/api/subjectsApi';
// import { useToast } from '@/hooks/use-toast';
// import { SubjectFormData } from '@/types';
// import { createSubject } from "@/services/subject";

// const formSchema = z.object({
//   name: z.string().min(2, 'Subject name must be at least 2 characters'),
//   code: z.string().min(2, 'Subject code must be at least 2 characters'),
//   description: z.string().min(10, 'Description must be at least 10 characters'),
//   department: z.string().min(1, 'Please select a department'),
//   credits: z.number().min(1, 'Credits must be at least 1').max(10, 'Credits cannot exceed 10'),
//   type: z.enum(['core', 'elective', 'practical', 'theory'] as const),
//   grade: z.string().min(1, 'Please select a grade'),
//   syllabus: z.array(z.string()),
//   prerequisites: z.array(z.string()),
// });

// interface CreateSubjectModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSuccess: () => void;
// }

// const CreateSubjectModal = ({ open, onOpenChange, onSuccess }: CreateSubjectModalProps) => {
//   const [syllabusInput, setSyllabusInput] = useState('');
//   const [prerequisitesInput, setPrerequisitesInput] = useState('');
  
//   const form = useForm<SubjectFormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: '',
//       code: '',
//       description: '',
//       department: '',
//       credits: 3,
//       type: 'core',
//       grade: '',
//       syllabus: [],
//       prerequisites: [],
//     },
//   });

//   const { toast } = useToast();
//   const [createSubjectState, { isLoading }] = useCreateSubjectMutation();

//   const departments = ['Mathematics', 'Science', 'English', 'Computer Science', 'History', 'Geography'];
//   const grades = ['9', '10', '11', '12'];

// const onSubmit = async (data: SubjectFormData) => {
//   try {
//     await createSubject({
//       name: data.name,
//       code: data.code,
//     });

//     toast({
//       title: "Subject Created",
//       description: "Subject has been successfully created.",
//     });

//     form.reset();
//     setSyllabusInput("");
//     setPrerequisitesInput("");
//     onSuccess();
//     onOpenChange(false);
//   } catch (error: any) {
//     toast({
//       title: "Error",
//       description: error.message || "Failed to create subject. Please try again.",
//       variant: "destructive",
//     });
//   }
// };


//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create New Subject</DialogTitle>
//           <DialogDescription>
//             Add a new subject to the curriculum. Fill in all the required information.
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Subject Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., Advanced Mathematics" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="code"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Subject Code</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., MATH301" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea 
//                       placeholder="Describe the subject content and objectives..."
//                       rows={3}
//                       {...field} 
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="department"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Department</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select department" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {departments.map((dept) => (
//                           <SelectItem key={dept} value={dept}>
//                             {dept}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="type"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Subject Type</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select type" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="core">Core</SelectItem>
//                         <SelectItem value="elective">Elective</SelectItem>
//                         <SelectItem value="practical">Practical</SelectItem>
//                         <SelectItem value="theory">Theory</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="grade"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Grade</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select grade" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {grades.map((grade) => (
//                           <SelectItem key={grade} value={grade}>
//                             Grade {grade}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="credits"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Credits</FormLabel>
//                     <FormControl>
//                       <Input 
//                         type="number" 
//                         min="1"
//                         max="10"
//                         placeholder="3"
//                         {...field}
//                         onChange={(e) => field.onChange(Number(e.target.value))}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div>
//               <label className="text-sm font-medium">Syllabus Topics</label>
//               <Input
//                 placeholder="Enter topics separated by commas (e.g., Calculus, Algebra, Statistics)"
//                 value={syllabusInput}
//                 onChange={(e) => setSyllabusInput(e.target.value)}
//                 className="mt-1"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 Separate topics with commas
//               </p>
//             </div>

//             <div>
//               <label className="text-sm font-medium">Prerequisites</label>
//               <Input
//                 placeholder="Enter prerequisites separated by commas (e.g., Basic Math, Algebra I)"
//                 value={prerequisitesInput}
//                 onChange={(e) => setPrerequisitesInput(e.target.value)}
//                 className="mt-1"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 Separate prerequisites with commas
//               </p>
//             </div>

//             <DialogFooter className="gap-2">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isLoading}>
//                 {isLoading ? 'Creating...' : 'Create Subject'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreateSubjectModal;


// import React from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useToast } from "@/hooks/use-toast";
// import { createSubject } from "@/services/subject";

// // ✅ Schema: name required, code optional
// const formSchema = z.object({
//   name: z.string().min(2, "Subject name must be at least 2 characters"),
//   code: z.string().optional(),
// });

// interface CreateSubjectModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSuccess: () => void;
// }

// const CreateSubjectModal = ({ open, onOpenChange, onSuccess }: CreateSubjectModalProps) => {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { name: "", code: "" },
//   });

//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = React.useState(false);

//   const onSubmit = async (data: z.infer<typeof formSchema>) => {
//     try {
//       setIsLoading(true);

//       // Only include code if it has value
//       const payload: { name: string; code?: string } = { name: data.name.trim() };
//       if (data.code?.trim()) payload.code = data.code.trim();

//       const response = await createSubject(payload);

//       if (response.success) {
//         toast({
//           title: "Subject Created",
//           description: response.message || "Subject has been successfully created.",
//         });
//         form.reset();
//         onSuccess();
//         onOpenChange(false);
//       } else {
//         toast({
//           title: "Error",
//           description: response.message || "Failed to create subject.",
//           variant: "destructive",
//         });
//       }
//     } catch (err: any) {
//       toast({
//         title: "Error",
//         description: err.response?.data?.message || err.message || "Something went wrong.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create New Subject</DialogTitle>
//           <DialogDescription>
//             Add a new subject to the curriculum. Fill in the required information.
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               {/* Subject Name */}
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       Subject Name <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., Advanced Mathematics" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Subject Code */}
//               <FormField
//                 control={form.control}
//                 name="code"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Subject Code (optional)</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., MATH101" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <DialogFooter className="gap-2">
//               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isLoading}>
//                 {isLoading ? "Creating..." : "Create Subject"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreateSubjectModal;





import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createSubject } from "@/services/subject";
import { Subject } from "@/types";

// ✅ Schema: name required, code optional
const formSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().optional(),
});

interface CreateSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newSubject: Subject) => void; // pass created subject to parent
}

const CreateSubjectModal = ({ open, onOpenChange, onSuccess }: CreateSubjectModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "" },
  });

  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string>(""); // <-- for server/API errors

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setApiError(""); // reset previous API errors

      const payload: { name: string; code?: string } = { name: data.name.trim() };
      if (data.code?.trim()) payload.code = data.code.trim();

      const response = await createSubject(payload);

      if (response.success && response.data) {
        toast({
          title: "Subject Created",
          description: response.message || "Subject has been successfully created.",
        });
        form.reset();
        onSuccess(response.data); // send new subject to parent
        onOpenChange(false);      // close modal
      } else {
        // API returned error
        setApiError(response.message || "Failed to create subject.");
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
          <DialogDescription>
            Add a new subject to the curriculum. Fill in the required information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Subject Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Subject Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced Mathematics" {...field} />
                    </FormControl>
                    {/* Show validation error OR API error */}
                    <FormMessage>
                      {fieldState.error?.message || (field.name === "name" && apiError)}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Subject Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MATH101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Subject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectModal;

