import React, { useState } from 'react';
import { Plus, Calendar, Users, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetClassTimetableQuery, useGetTeacherTimetableQuery, useFindFreeTeachersMutation } from '@/store/api/timetableApi';
import { useGetClassesQuery } from '@/store/api/classesApi';
import { useGetTeachersQuery, useGetSubjectsQuery } from '@/store/api/subjectsApi';
import { CreatePeriodModal } from './CreatePeriodModal';
import { AutoGenerateModal } from './AutoGenerateModal';
import { FindFreeTeachersModal } from './FindFreeTeachersModal';

export const TimetableManagement: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [createPeriodOpen, setCreatePeriodOpen] = useState(false);
  const [autoGenerateOpen, setAutoGenerateOpen] = useState(false);
  const [findTeachersOpen, setFindTeachersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('class');

  const { data: classesResponse } = useGetClassesQuery({ page: 1, limit: 100, search: '' });
  const { data: teachersResponse } = useGetTeachersQuery();
  const { data: classTimetable } = useGetClassTimetableQuery(selectedClassId, {
    skip: !selectedClassId,
  });
  const { data: teacherTimetable } = useGetTeacherTimetableQuery(selectedTeacherId, {
    skip: !selectedTeacherId,
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  // Extract data from API responses
  const classes = classesResponse?.data?.data || [];
  const teachers = teachersResponse?.data || [];

  const renderClassTimetable = () => {
    if (!classTimetable) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-2 text-sm">
          {/* Header */}
          <div className="font-semibold p-3 bg-muted rounded-lg text-center">Day</div>
          {periods.map((period) => (
            <div key={period} className="font-semibold p-3 bg-muted rounded-lg text-center">
              Period {period}
            </div>
          ))}

          {/* Timetable Grid */}
          {days.map((day, dayIndex) => (
            <React.Fragment key={day}>
              <div className="font-medium p-3 bg-muted/50 rounded-lg text-center">{day}</div>
              {periods.map((period) => {
                const periodData = classTimetable.periods.find(
                  (p) => p.dayIndex === dayIndex && p.period === period
                );
                
                return (
                  <div
                    key={`${day}-${period}`}
                    className="p-2 border rounded-lg min-h-[80px] flex flex-col justify-center items-center text-center relative"
                    style={{ backgroundColor: periodData ? `${periodData.color}15` : 'transparent' }}
                  >
                    {periodData ? (
                      <>
                        <div className="font-medium text-xs mb-1" style={{ color: periodData.color }}>
                          {periodData.subjectName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {periodData.teacherName}
                        </div>
                        {periodData.room && (
                          <div className="text-xs text-muted-foreground">
                            {periodData.room}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">Free</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderTeacherTimetable = () => {
    if (!teacherTimetable) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{teacherTimetable.teacherName}'s Timetable</h3>
          <Badge variant="secondary">
            {teacherTimetable.freePeriods.length} Free Periods
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-9 gap-2 text-sm">
          {/* Header */}
          <div className="font-semibold p-3 bg-muted rounded-lg text-center">Day</div>
          {periods.map((period) => (
            <div key={period} className="font-semibold p-3 bg-muted rounded-lg text-center">
              Period {period}
            </div>
          ))}

          {/* Timetable Grid */}
          {days.map((day, dayIndex) => (
            <React.Fragment key={day}>
              <div className="font-medium p-3 bg-muted/50 rounded-lg text-center">{day}</div>
              {periods.map((period) => {
                const periodData = teacherTimetable.periods.find(
                  (p) => p.dayIndex === dayIndex && p.period === period
                );
                const isFree = teacherTimetable.freePeriods.some(
                  (fp) => fp.dayIndex === dayIndex && fp.period === period
                );
                
                return (
                  <div
                    key={`${day}-${period}`}
                    className={`p-2 border rounded-lg min-h-[80px] flex flex-col justify-center items-center text-center relative ${
                      isFree ? 'bg-green-50' : ''
                    }`}
                    style={{ backgroundColor: periodData ? `${periodData.color}15` : isFree ? '#f0fdf4' : 'transparent' }}
                  >
                    {periodData ? (
                      <>
                        <div className="font-medium text-xs mb-1" style={{ color: periodData.color }}>
                          {periodData.subjectName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {periodData.className}
                        </div>
                        {periodData.room && (
                          <div className="text-xs text-muted-foreground">
                            {periodData.room}
                          </div>
                        )}
                      </>
                    ) : isFree ? (
                      <div className="text-xs text-green-600 font-medium">Free</div>
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Timetable Management</h1>
          <p className="text-muted-foreground">Manage class and teacher timetables</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreatePeriodOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Period
          </Button>
          <Button variant="outline" onClick={() => setAutoGenerateOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Auto Generate
          </Button>
          <Button variant="outline" onClick={() => setFindTeachersOpen(true)}>
            <UserCheck className="mr-2 h-4 w-4" />
            Find Free Teachers
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="class">Class Timetable</TabsTrigger>
          <TabsTrigger value="teacher">Teacher Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Timetable View</CardTitle>
              <CardDescription>
                Select a class to view and manage its timetable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClassId && renderClassTimetable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Timetable View</CardTitle>
              <CardDescription>
                Select a teacher to view their schedule and free periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTeacherId && renderTeacherTimetable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreatePeriodModal 
        open={createPeriodOpen} 
        onOpenChange={setCreatePeriodOpen} 
      />
      
      <AutoGenerateModal 
        open={autoGenerateOpen} 
        onOpenChange={setAutoGenerateOpen} 
      />
      
      <FindFreeTeachersModal 
        open={findTeachersOpen} 
        onOpenChange={setFindTeachersOpen} 
      />
    </div>
  );
};