import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import type { ExamTimetable } from '@/types/exams';

interface ViewExamTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamTimetable | null;
}

export function ViewExamTimetableModal({ 
  isOpen, 
  onClose, 
  exam 
}: ViewExamTimetableModalProps) {
  if (!exam) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Exam Timetable</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exam Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{exam.examName}</h3>
                <Badge className={getStatusColor('scheduled')}>
                  Scheduled
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Academic Year:</span>
                  <span className="ml-1">{exam.academicYear}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Type:</span>
                  <span className="ml-1 capitalize">{exam.examType}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Duration:</span>
                  <span className="ml-1">{exam.startDate} to {exam.endDate}</span>
                </div>
              </div>
              
              {exam.description && (
                <div className="mt-4">
                  <p className="text-muted-foreground">{exam.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Grid */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Exam Schedule</h4>
            
            {exam.schedules.length > 0 ? (
              <div className="space-y-3">
                {[...exam.schedules]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((schedule) => (
                    <Card key={schedule.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-lg font-semibold">{schedule.subjectName}</h5>
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Date:</span>
                              <div>{new Date(schedule.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Time:</span>
                              <div>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Room:</span>
                              <div>{schedule.room}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">Invigilator:</span>
                              <div>{schedule.invigilatorName}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                          <div>
                            <span className="font-medium">Class:</span>
                            <span className="ml-1">{schedule.className}</span>
                          </div>
                          <div>
                            <span className="font-medium">Max Marks:</span>
                            <span className="ml-1">{schedule.maxMarks}</span>
                          </div>
                        </div>
                        
                        {schedule.instructions && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="font-medium">Instructions:</span>
                            <p className="text-muted-foreground mt-1">{schedule.instructions}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No exam schedules added yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create exam schedules to see them here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}