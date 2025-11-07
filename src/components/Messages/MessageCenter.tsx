import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Send, Mail, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ✅ API imports
import { getAllStudents } from "@/services/StudentsApi";
import { getAllTeachers } from "@/services/TeachersApi";
import { getAllClasses } from "@/services/ClassesApi"; 

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  date: string;
  status: "unread" | "read";
}

const MessageCenter = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  const [messages, setMessages] = useState<Message[]>([]);

  // Recipient state
  const [recipientType, setRecipientType] = useState("students");
  const [recipientTarget, setRecipientTarget] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Data from APIs
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // ✅ Fetch data on mount
  useEffect(() => {
    if (recipientType === "students") {
      getAllStudents().then((data)=>setStudents(data.students)).catch(console.error);
    }
    if (recipientType === "teachers") {
      getAllTeachers().then((data)=>setTeachers(data.teachers)).catch(console.error);
    }
    if (recipientType === "class") {
      getAllClasses().then(setClasses).catch(console.error);
    }
  }, [recipientType]);

  const handleSendMessage = () => {
    if (!subject || !body) return;

    let recipientLabel = "";

    if (recipientType === "all") {
      recipientLabel = "Everyone";
    } else if (recipientType === "students") {
      recipientLabel =
        recipientTarget === "all"
          ? "All Students"
          : `Student: ${recipientTarget}`;
    } else if (recipientType === "teachers") {
      recipientLabel =
        recipientTarget === "all"
          ? "All Teachers"
          : `Teacher: ${recipientTarget}`;
    } else if (recipientType === "parents") {
      recipientLabel =
        recipientTarget === "all"
          ? "All Parents"
          : `Parent: ${recipientTarget}`;
    } else if (recipientType === "class") {
      recipientLabel = `Class: ${recipientTarget}`;
    }

    const message: Message = {
      id: Date.now().toString(),
      sender: "Admin",
      recipient: recipientLabel,
      subject,
      body,
      date: new Date().toLocaleDateString(),
      status: "unread",
    };

    setMessages([message, ...messages]);
    setRecipientType("students");
    setRecipientTarget("all");
    setSubject("");
    setBody("");
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gradient-primary">
        Message Center
      </h1>

      {/* ✅ Compose only visible for Admin */}
      {userRole === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Two Column Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Column: Recipient Type */}
              <Select
                value={recipientType}
                onValueChange={(val) => {
                  setRecipientType(val);
                  setRecipientTarget("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                </SelectContent>
              </Select>

              {/* Second Column: Specific Target */}
              {recipientType === "all" && (
                <Input value="Everyone" disabled />
              )}

              {recipientType === "students" && (
                <Select
                  value={recipientTarget}
                  onValueChange={(val) => setRecipientTarget(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {recipientType === "teachers" && (
                <Select
                  value={recipientTarget}
                  onValueChange={(val) => setRecipientTarget(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={`${t.firstName} ${t.lastName}`}>
                        {t.firstName} {t.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {recipientType === "parents" && (
                <Select
                  value={recipientTarget}
                  onValueChange={(val) => setRecipientTarget(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parents</SelectItem>
                    {/* ⚡ if you have parents API, map it here */}
                    <SelectItem value="Parent of John">Parent of John</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {recipientType === "class" && (
                <Select
                  value={recipientTarget}
                  onValueChange={(val) => setRecipientTarget(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.name || c.className}>
                        {c.name || c.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Subject & Body */}
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              rows={4}
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <Button onClick={handleSendMessage} className="gap-2">
              <Send className="w-4 h-4" /> Send
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ✅ Inbox visible to everyone */}
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground">No messages</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 border rounded-lg flex justify-between items-start hover:bg-accent/50 transition"
              >
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {msg.subject}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    From: {msg.sender} • To: {msg.recipient}
                  </p>
                  <p className="mt-2">{msg.body}</p>
                  <Badge
                    variant={msg.status === "unread" ? "secondary" : "outline"}
                  >
                    {msg.status}
                  </Badge>
                </div>

                {/* ✅ Only Admin can delete */}
                {userRole === "admin" && (
                  <Button
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDeleteMessage(msg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageCenter;
