import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Phone, MapPin, User, Calendar } from 'lucide-react';
import { TeacherFormData } from '@/types';

interface TeacherDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherFormData & {
    id: string;
    teacherId: string;
    userId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

const TeacherDetailsModal = ({ open, onOpenChange, teacher }: TeacherDetailsModalProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'onLeave':
        return <Badge className="bg-warning/10 text-warning">On Leave</Badge>;
      case 'retired':
        return <Badge variant="destructive">Retired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-primary">Teacher Details</DialogTitle>
          <DialogDescription>
            Complete information for {teacher.firstName} {teacher.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-6 p-6 bg-accent/50 rounded-lg">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-2xl font-bold">
                {teacher.firstName[0]}{teacher.lastName[0]}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {teacher.firstName} {teacher.lastName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="font-medium">ID: {teacher.teacherId}</span>
                <span>•</span>
                <span>{teacher.position} - {teacher.department}</span>
                <span>•</span>
                <span>Joined: {new Date(teacher.dateOfJoining).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(teacher.status)}
              </div>
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
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{teacher.email}</div>
                  </div>
                </div>

                {teacher.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{teacher.phone}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">
                      {new Date(teacher.dateOfBirth).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div className="font-medium">{teacher.address}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Department</div>
                  <div className="font-medium">{teacher.department}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Position</div>
                  <div className="font-medium">{teacher.position}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date of Joining</div>
                  <div className="font-medium">{new Date(teacher.dateOfJoining).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Salary</div>
                  <div className="font-medium">${teacher.salary}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Subject Specialization</div>
                  <div className="font-medium">{teacher.subjectSpecialization.join(', ')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Qualifications</div>
                  <div className="font-medium">{teacher.qualifications.join(', ')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Years of Experience</div>
                  <div className="font-medium">{teacher.yearsOfExperience}</div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
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
                  <div className="font-medium">{teacher.emergencyContact.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{teacher.emergencyContact.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Relationship</div>
                  <div className="font-medium">{teacher.emergencyContact.relation}</div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Teacher ID</div>
                  <div className="font-medium font-mono">{teacher.teacherId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">User ID</div>
                  <div className="font-medium font-mono">{teacher.userId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created At</div>
                  <div className="font-medium">{new Date(teacher.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="font-medium">{new Date(teacher.updatedAt).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherDetailsModal;
