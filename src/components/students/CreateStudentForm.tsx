import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllClasses } from '@/services/ClassesApi';
import { createStudentApi } from '@/services/StudentsApi';

const studentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  classId: z.string().min(1, 'Class is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  fatherName: z.string().min(2, 'Father name is required'),
  fatherContact: z.string().min(10, 'Father contact number is required'),
  fatherEmail: z.string().email('Invalid father email').optional().or(z.literal('')),
  fatherOccupation: z.string().min(2, 'Father occupation is required'),
  motherName: z.string().min(2, 'Mother name is required'),
  motherContact: z.string().min(10, 'Mother contact number is required'),
  motherEmail: z.string().email('Invalid mother email').optional().or(z.literal('')),
  motherOccupation: z.string().min(2, 'Mother occupation is required'),
  contactName: z.string().min(2, 'Emergency contact name is required'),
  contactPhone: z.string().min(10, 'Emergency contact phone is required'),
  relation: z.string().min(2, 'Relation to student is required'),
  contactEmail: z.string().email('Invalid emergency contact email').optional().or(z.literal('')),
});

interface StudentFormData extends z.infer<typeof studentSchema> {}

interface CreateStudentFormProps {
  onClose: () => void;
  onStudentCreated: () => void;
}

export function CreateStudentForm({ onClose, onStudentCreated }: CreateStudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      classId: '',
      address: '',
      email: '',
      phone: '',
      fatherName: '',
      fatherContact: '',
      fatherEmail: '',
      fatherOccupation: '',
      motherName: '',
      motherContact: '',
      motherEmail: '',
      motherOccupation: '',
      contactName: '',
      contactPhone: '',
      relation: '',
      contactEmail: '',
    },
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const classesData = await getAllClasses();
      if (Array.isArray(classesData)) {
        setClasses(classesData);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch classes',
        variant: 'destructive',
      });
    }
  };
const onSubmit = async (data: StudentFormData) => {
  try {
    setLoading(true);

    const studentData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dob: data.dateOfBirth,          // frontend -> backend mapping
      address: data.address,
      classId: data.classId,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      relation: data.relation,
      contactEmail: data.contactEmail,
      fatherName: data.fatherName,
      fatherphone: data.fatherContact,    // frontend -> backend mapping
      fatherEmail: data.fatherEmail,
      fatherOccupation: data.fatherOccupation,
      motherName: data.motherName,
      motherphone: data.motherContact,    // frontend -> backend mapping
      motherEmail: data.motherEmail,
      motherOccupation: data.motherOccupation,
    };

    const response = await createStudentApi(studentData);

    if (response.student) {
      toast({
        title: 'Success',
        description: `Student created successfully. Registration Number: ${response.student.registrationNumber}`,
      });
      onStudentCreated();
      onClose();
    } else {
      throw new Error(response.message || 'Failed to create student');
    }
  } catch (error) {
    console.error('Error creating student:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to create student',
      variant: 'destructive',
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
            {/* Student Info */}
            <h3 className="text-lg font-semibold">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input placeholder="Enter first name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input placeholder="Enter last name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.length === 0 ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            classes.map((cls) => (
                              <SelectItem key={cls._id} value={cls._id}>
                                {cls.grade} - {cls.section}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="Enter email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input placeholder="Enter phone number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input placeholder="Enter full address" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Father Info */}
            <h3 className="text-lg font-semibold mt-6">Father Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fatherName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Name</FormLabel>
                  <FormControl><Input placeholder="Enter father's name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherContact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Contact</FormLabel>
                  <FormControl><Input placeholder="Enter father's contact" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Email</FormLabel>
                  <FormControl><Input placeholder="Enter father's email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Occupation</FormLabel>
                  <FormControl><Input placeholder="Enter father's occupation" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Mother Info */}
            <h3 className="text-lg font-semibold mt-6">Mother Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="motherName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Name</FormLabel>
                  <FormControl><Input placeholder="Enter mother's name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="motherContact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Contact</FormLabel>
                  <FormControl><Input placeholder="Enter mother's contact" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="motherEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Email</FormLabel>
                  <FormControl><Input placeholder="Enter mother's email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="motherOccupation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Occupation</FormLabel>
                  <FormControl><Input placeholder="Enter mother's occupation" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Emergency Contact */}
            <h3 className="text-lg font-semibold mt-6">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="contactName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl><Input placeholder="Enter contact name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl><Input placeholder="Enter contact phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="relation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation</FormLabel>
                  <FormControl><Input placeholder="Enter relation to student" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl><Input placeholder="Enter contact email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
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
