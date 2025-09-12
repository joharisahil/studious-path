import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Plus, Eye } from 'lucide-react';
import { useGetExamTimetablesQuery } from '@/store/api/examsApi';
import { CreateExamModal } from './CreateExamModal';
import { CreateExamScheduleModal } from './CreateExamScheduleModal';
import { ViewExamTimetableModal } from './ViewExamTimetableModal';
import type { ExamTimetable } from '@/types/exams';

export function ExamManagement() {
  const [activeTab, setActiveTab] = useState('timetables');
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showViewTimetable, setShowViewTimetable] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamTimetable | null>(null);

  const { data: examTimetables, isLoading, refetch } = useGetExamTimetablesQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewTimetable = (exam: ExamTimetable) => {
    setSelectedExam(exam);
    setShowViewTimetable(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading exam data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground">Create and manage exam schedules</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateExam(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
          <Button onClick={() => setShowCreateSchedule(true)} variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Exam
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timetables">Exam Timetables</TabsTrigger>
          <TabsTrigger value="schedules">Exam Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="timetables" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {examTimetables?.data?.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exam.examName}</CardTitle>
                    <Badge className={getStatusColor('scheduled')}>
                      Scheduled
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {exam.academicYear}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      {exam.startDate} - {exam.endDate}
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-4 w-4" />
                      {exam.schedules.length} subjects scheduled
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exam.description}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewTimetable(exam)}
                      className="flex-1"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!examTimetables?.data?.length && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Exam Timetables</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first exam timetable to get started
                </p>
                <Button onClick={() => setShowCreateExam(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Exam
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Exam Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examTimetables?.data?.flatMap(exam => 
                  exam.schedules.map(schedule => (
                    <div key={schedule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{schedule.subjectName}</h4>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {schedule.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {schedule.room}
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          {schedule.invigilatorName}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Class:</span> {schedule.className} | 
                        <span className="font-medium"> Max Marks:</span> {schedule.maxMarks}
                      </div>
                    </div>
                  ))
                )}
                
                {!examTimetables?.data?.some(exam => exam.schedules.length > 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>No exam schedules found</p>
                    <p className="text-sm">Create an exam and add schedules to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateExamModal 
        isOpen={showCreateExam}
        onClose={() => setShowCreateExam(false)}
        onExamCreated={() => {
          refetch();
          setShowCreateExam(false);
        }}
      />

      <CreateExamScheduleModal
        isOpen={showCreateSchedule}
        onClose={() => setShowCreateSchedule(false)}
        onScheduleCreated={() => {
          refetch();
          setShowCreateSchedule(false);
        }}
      />

      <ViewExamTimetableModal
        isOpen={showViewTimetable}
        onClose={() => setShowViewTimetable(false)}
        exam={selectedExam}
      />
    </div>
  );
}