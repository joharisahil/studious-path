import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Subject } from '@/types';

interface SubjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
}

const SubjectDetailsModal = ({ open, onOpenChange, subject }: SubjectDetailsModalProps) => {
  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'core':
        return <Badge className="bg-primary/10 text-primary">Core</Badge>;
      case 'elective':
        return <Badge className="bg-info/10 text-info">Elective</Badge>;
      case 'practical':
        return <Badge className="bg-warning/10 text-warning">Practical</Badge>;
      case 'theory':
        return <Badge variant="secondary">Theory</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

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
                  <span className="text-sm font-medium text-muted-foreground">Department</span>
                  <p className="text-sm mt-1">{subject.department}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Grade</span>
                  <div className="mt-1">
                    <Badge variant="outline">Grade {subject.grade}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <div className="mt-1">
                    {getTypeBadge(subject.type)}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Credits</span>
                  <p className="text-sm mt-1">{subject.credits}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p className="text-sm mt-1 text-foreground">{subject.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Information */}
          {subject.teacherId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {subject.teacherName?.split(' ').map(n => n[0]).join('') || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{subject.teacherName}</p>
                    <p className="text-sm text-muted-foreground">{subject.department} Department</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Class Schedule */}
          {subject.classSchedule && subject.classSchedule.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Schedule</CardTitle>
                <CardDescription>Weekly class timings and room assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subject.classSchedule.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {daysOfWeek[schedule.dayOfWeek]}
                        </Badge>
                        <span className="text-sm font-medium">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {schedule.room}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Syllabus */}
          {subject.syllabus && subject.syllabus.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Syllabus</CardTitle>
                <CardDescription>Topics covered in this subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {subject.syllabus.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {subject.prerequisites && subject.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prerequisites</CardTitle>
                <CardDescription>Required subjects before taking this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {subject.prerequisites.map((prerequisite, index) => (
                    <Badge key={index} variant="outline" className="bg-warning/10 text-warning">
                      {prerequisite}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {subject.resources && subject.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
                <CardDescription>Learning materials and tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subject.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{resource}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Created At</span>
                  <p className="mt-1">{new Date(subject.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Last Updated</span>
                  <p className="mt-1">{new Date(subject.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Status</span>
                  <div className="mt-1">
                    <Badge variant={subject.isActive ? "default" : "secondary"}>
                      {subject.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectDetailsModal;