import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, Phone, MapPin, User, GraduationCap, Users, Briefcase } from 'lucide-react';
import { Student } from '@/types';

interface StudentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

const StudentDetailsModal = ({ open, onOpenChange, student }: StudentDetailsModalProps) => {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'graduated':
        return <Badge className="bg-info/10 text-info">Graduated</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!student ? (
          <div className="text-center text-muted-foreground py-8">No student selected</div>
        ) : (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-gradient-primary">Student Details</DialogTitle>
              <DialogDescription>
                Complete information for {student.firstName} {student.lastName}
              </DialogDescription>
            </DialogHeader>

            {/* Header Section */}
            <div className="flex items-start gap-6 p-6 bg-accent/50 rounded-lg">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-2xl font-bold">
                  {(student.firstName?.[0] ?? '')}
                  {(student.lastName?.[0] ?? '')}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {student.firstName} {student.lastName}
                </h2>
                {student.registrationNumber && (
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    ID: {student.registrationNumber}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                  {student.grade && (
                    <span>
                      Class {student.grade} - Section {student.section ?? '-'}
                    </span>
                  )}
                  {student.enrollmentDate && (
                    <>
                      <span>•</span>
                      <span>
                        Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(student.status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{student.email}</div>
                      </div>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{student.phone}</div>
                      </div>
                    </div>
                  )}
                  {student.dob && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Date of Birth</div>
                        <div className="font-medium">{new Date(student.dob).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">Address</div>
                        <div className="font-medium">{student.address}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

             {/* Academic Information */}
<Card>
  <CardHeader>
    <CardTitle className="text-base flex items-center gap-2">
      <GraduationCap className="w-4 h-4" />
      Academic Information
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-muted-foreground">Class</div>
        <div className="font-medium">{student.classId?.grade ?? '-'}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Section</div>
        <div className="font-medium">{student.classId?.section ?? '-'}</div>
      </div>
    </div>
    <div>
      <div className="text-sm text-muted-foreground">Enrollment Date</div>
      <div className="font-medium">
        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
      </div>
    </div>
    {/* <div>
      <div className="text-sm text-muted-foreground">Status</div>
      <div className="mt-1">{getStatusBadge(student.status)}</div>
    </div> */}
  </CardContent>
</Card>

            </div>

            {/* Parent Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Parent Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Father */}
                <div className="space-y-2 p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-medium">Father</h4>
                  {student.fatherName && <p><strong>Name:</strong> {student.fatherName}</p>}
                  {student.fatherEmail && <p><strong>Email:</strong> {student.fatherEmail}</p>}
                  {student.fatherphone && <p><strong>Phone:</strong> {student.fatherphone}</p>}
                  {student.fatherOccupation && (
                    <p className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      {student.fatherOccupation}
                    </p>
                  )}
                </div>

                {/* Mother */}
                <div className="space-y-2 p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-medium">Mother</h4>
                  {student.motherName && <p><strong>Name:</strong> {student.motherName}</p>}
                  {student.motherEmail && <p><strong>Email:</strong> {student.motherEmail}</p>}
                  {student.motherphone && <p><strong>Phone:</strong> {student.motherphone}</p>}
                  {student.motherOccupation && (
                    <p className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      {student.motherOccupation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {student.contactName && student.contactPhone && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{student.contactName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">{student.contactPhone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Relation</div>
                    <div className="font-medium">{student.relation ?? '-'}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;
