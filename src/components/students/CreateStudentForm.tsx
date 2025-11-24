import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getAllClasses } from "@/services/ClassesApi";
import { createStudentApi } from "@/services/StudentsApi";

// ✅ FIRST NAME, PHONE, SESSION & CLASS MANDATORY
const studentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),

  dob: z.string().optional(),

  // ✅ NOW MANDATORY
  session: z.string().min(1, "Session is required"),

  // ✅ NOW MANDATORY
  classId: z.string().min(1, "Class is required"),

  address: z.string().optional(),
  aadhaarNumber: z.string().optional(),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number cannot exceed 10 digits"),

  caste: z.string().optional(),

  fatherName: z.string().optional(),
  fatherphone: z.string().optional(),
  fatherEmail: z.string().email().optional().or(z.literal("")).optional(),
  fatherOccupation: z.string().optional(),

  motherName: z.string().optional(),
  motherphone: z.string().optional(),
  motherEmail: z.string().email().optional().or(z.literal("")).optional(),
  motherOccupation: z.string().optional(),

  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  relation: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")).optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface CreateStudentFormProps {
  onClose: () => void;
  onStudentCreated: () => void;
}

export function CreateStudentForm({
  onClose,
  onStudentCreated,
}: CreateStudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dob: "",
      classId: "",
      session: "",
      phone: "",
      address: "",
      aadhaarNumber: "",
      caste: "",
      fatherName: "",
      fatherphone: "",
      fatherEmail: "",
      fatherOccupation: "",
      motherName: "",
      motherphone: "",
      motherEmail: "",
      motherOccupation: "",
      contactName: "",
      contactPhone: "",
      relation: "",
      contactEmail: "",
    },
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await getAllClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load classes",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      setLoading(true);

      const response = await createStudentApi(data);

      toast({
        title: "Student Created Successfully",
        description: `Registration No: ${response.student.registrationNumber}`,
      });

      onStudentCreated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Student</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold">Student Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ✅ FIRST NAME (MANDATORY) */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ LAST NAME OPTIONAL */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ✅ DOB OPTIONAL */}
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ✅ SESSION NOW MANDATORY */}
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Session <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="2024-2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ CLASS NOW MANDATORY */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Class <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls: any) => (
                            <SelectItem key={cls._id} value={cls._id}>
                              {cls.grade} - {cls.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ PHONE MANDATORY */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ ADDRESS OPTIONAL */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full address" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ✅ AADHAAR OPTIONAL */}
              <FormField
                control={form.control}
                name="aadhaarNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter aadhaar number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ✅ CASTE OPTIONAL */}
              <FormField
                control={form.control}
                name="caste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caste (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter caste" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* ✅ FATHER INFO */}
            <h3 className="text-lg font-semibold mt-6">Father Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father's name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherphone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father's phone" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father's email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherOccupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father Occupation (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter father's occupation"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* ✅ MOTHER INFO */}
            <h3 className="text-lg font-semibold mt-6">Mother Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mother's name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherphone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mother's phone" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mother's email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherOccupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Occupation (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter mother's occupation"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* ✅ EMERGENCY CONTACT */}
            <h3 className="text-lg font-semibold mt-6">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact phone" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relation (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Relation with student" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* ✅ BUTTONS */}
            <div className="flex justify-end mt-6 space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Student
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default CreateStudentForm;
