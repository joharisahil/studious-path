import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Subject } from '@/types';

interface SubjectWithExtras extends Subject {
  grade: string;
}

interface SubjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectWithExtras;
}

const SubjectDetailsModal = ({ open, onOpenChange, subject }: SubjectDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {subject.name}
            <Badge variant="outline">{subject.code}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Subject Code</span>
                  <p className="text-sm mt-1">{subject.code}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Name</span>
                  <p className="text-sm mt-1">{subject.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Grade</span>
                  <div className="mt-1">
                    <Badge variant="outline">{subject.grade}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Teachers */}
              <div>
                <span className="text-sm font-medium text-muted-foreground">Assigned Teachers</span>
                {subject.teachers && subject.teachers.length > 0 ? (
                  <div className="mt-2 flex flex-col gap-2">
                    {subject.teachers.map((teacher) => (
                      <div key={teacher._id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">
                            {`${teacher.firstName[0] || ''}${teacher.lastName[0] || ''}`}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{`${teacher.firstName} ${teacher.lastName}`}</p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">No teachers assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectDetailsModal;
