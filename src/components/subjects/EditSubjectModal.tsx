// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { useUpdateSubjectMutation } from '@/store/api/subjectsApi';
// import { useToast } from '@/hooks/use-toast';
// import { Subject, SubjectFormData } from '@/types';

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

// interface EditSubjectModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   subject: Subject;
//   onSuccess: () => void;
// }

// const EditSubjectModal = ({ open, onOpenChange, subject, onSuccess }: EditSubjectModalProps) => {
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
//   const [updateSubject, { isLoading }] = useUpdateSubjectMutation();

//   const departments = ['Mathematics', 'Science', 'English', 'Computer Science', 'History', 'Geography'];
//   const grades = ['9', '10', '11', '12'];

//   useEffect(() => {
//     if (subject && open) {
//       form.reset({
//         name: subject.name,
//         code: subject.code,
//         description: subject.description,
//         department: subject.department,
//         credits: subject.credits,
//         type: subject.type,
//         grade: subject.grade,
//         syllabus: subject.syllabus,
//         prerequisites: subject.prerequisites,
//       });
//       setSyllabusInput(subject.syllabus.join(', '));
//       setPrerequisitesInput(subject.prerequisites.join(', '));
//     }
//   }, [subject, open, form]);

//   const onSubmit = async (data: SubjectFormData) => {
//     try {
//       const syllabus = syllabusInput.split(',').map(item => item.trim()).filter(item => item);
//       const prerequisites = prerequisitesInput.split(',').map(item => item.trim()).filter(item => item);

//       await updateSubject({
//         id: subject.id,
//         ...data,
//         syllabus,
//         prerequisites,
//       }).unwrap();

//       toast({
//         title: "Subject Updated",
//         description: "Subject has been successfully updated.",
//       });

//       onSuccess();
//       onOpenChange(false);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update subject. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Edit Subject</DialogTitle>
//           <DialogDescription>
//             Update the subject information. Make changes as needed.
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
//                     <Select onValueChange={field.onChange} value={field.value}>
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
//                     <Select onValueChange={field.onChange} value={field.value}>
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
//                     <Select onValueChange={field.onChange} value={field.value}>
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
//                 {isLoading ? 'Updating...' : 'Update Subject'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EditSubjectModal;

import { useEffect } from "react";
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
import { Subject } from "@/types";
import { updateSubject as apiUpdateSubject } from "@/services/subject";

// ✅ Validation Schema
const formSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters long"),
  code: z.string().optional(),
});

interface EditSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSuccess: () => void;
}

const EditSubjectModal = ({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: EditSubjectModalProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "" },
  });

  // ✅ Pre-fill form when modal opens
  useEffect(() => {
    if (subject && open) {
      form.reset({
        name: subject.name || "",
        code: subject.code || "",
      });
    }
  }, [subject, open, form]);

  // ✅ Submit Handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!subject || !subject.code) return;

    try {
      const payload = {
        name: data.name.trim(),
        code: data.code?.trim() || subject.code,
      };

      await apiUpdateSubject(subject.code, payload);

      toast({
        title: "Subject Updated",
        description: "The subject details have been updated successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating subject:", error);
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to update subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Update the subject information below.
          </DialogDescription>
        </DialogHeader>

        {!subject ? (
          <p className="text-center text-gray-500">No subject selected.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Subject Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Subject</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectModal;



