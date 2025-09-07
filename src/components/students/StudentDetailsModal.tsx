import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, Phone, MapPin, User, GraduationCap, Users } from 'lucide-react';
import { Student } from '@/types';

interface StudentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null; // <-- allow null
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
        return <Badge variant="secondary">{status ?? 'Unknown'}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!student ? (
          <div className="text-center text-muted-foreground py-8">
            No student selected
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-gradient-primary">Student Details</DialogTitle>
              <DialogDescription>
                Complete information for {student.firstName} {student.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start gap-6 p-6 bg-accent/50 rounded-lg">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-2xl font-bold">
                    {(student.firstName?.[0] ?? '')}{(student.lastName?.[0] ?? '')}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {student.firstName} {student.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span className="font-medium">ID: {student.studentId}</span>
                    {student.grade && <span>• Grade {student.grade} - Section {student.section ?? '-'}</span>}
                    {student.enrollmentDate && (
                      <>
                        <span>•</span>
                        <span>Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(student.status)}
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

                    {student.dateOfBirth && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Date of Birth</div>
                          <div className="font-medium">
                            {new Date(student.dateOfBirth).toLocaleDateString()}
                          </div>
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
                        <div className="text-sm text-muted-foreground">Grade</div>
                        <div className="font-medium">Grade {student.grade ?? '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Section</div>
                        <div className="font-medium">Section {student.section ?? '-'}</div>
                      </div>
                    </div>

                    {student.enrollmentDate && (
                      <div>
                        <div className="text-sm text-muted-foreground">Enrollment Date</div>
                        <div className="font-medium">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="mt-1">{getStatusBadge(student.status)}</div>
                    </div>

                    {student.academicHistory?.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Academic History</div>
                        <div className="space-y-2">
                          {student.academicHistory.map((record, index) => (
                            <div key={index} className="p-3 bg-accent/50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{record.year}</span>
                                <Badge variant="outline">GPA: {record.gpa}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Grade {record.grade}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Contact */}
              {student.emergencyContact && (
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
                      <div className="font-medium">{student.emergencyContact.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{student.emergencyContact.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Relationship</div>
                      <div className="font-medium">{student.emergencyContact.relation}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Academic Performance */}
              {student.academicHistory?.[0]?.subjects?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Academic Performance</CardTitle>
                    <CardDescription>
                      Subject-wise performance and grades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {student.academicHistory[0].subjects.map((subject, index) => (
                        <div key={index} className="p-4 bg-accent/50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{subject.subjectName}</span>
                            <Badge variant={subject.grade === 'A+' ? 'default' : 'secondary'}>
                              {subject.grade}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subject.marks}/{subject.totalMarks} marks
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(subject.marks / subject.totalMarks) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;
