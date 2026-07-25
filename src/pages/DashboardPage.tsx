import React, { useState, useEffect } from "react";
import { 
  Activity, 
  ArrowUpRight, 
  MessageCircle, 
  Inbox, 
  TrendingUp, 
  TrendingDown,
  Send,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  BarChart3,
  Loader2,
  GripVertical,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface DashboardStats {
  totalMessagesToday: number;
  totalIncomingToday: number;
  deliverySuccessRate: number;
  upcomingBirthdays: number;
  messagesTrend: number;
  successTrend: number;
  birthdayTrend: number;
}

interface MessageTrend {
  day: string;
  messages: number;
  date: Date;
}

interface RecentDelivery {
  id: string;
  patientName: string;
  messageType: string;
  messageContent: string;
  status: "sent" | "failed";
  timestamp: string;
  created_at: string;
}

interface UpcomingBirthday {
  id: string;
  name: string;
  date_of_birth: string;
  daysLeft: number;
}

interface ScheduledBroadcast {
  id: string;
  title: string;
  scheduled_time: string;
  status: "pending" | "processing" | "completed" | "failed";
  user_id: string;
  created_at: string;
  task_count?: number;
}

const DEFAULT_LAYOUT_ORDER = [
  "stats_grid",
  "trends_and_quickactions",
  "schedule_broadcasts",
  "recent_activity",
];

const STORAGE_KEY = "mediflow_dashboard_layout_order";

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "EEEE, d MMMM yyyy 'pukul' HH:mm", { locale: id });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>;
    case "processing":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Memproses</span>;
    case "completed":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Selesai</span>;
    case "failed":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Gagal</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
  }
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // State Layout Drag & Drop
  const [layoutOrder, setLayoutOrder] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    return savedOrder ? JSON.parse(savedOrder) : DEFAULT_LAYOUT_ORDER;
  });
  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    totalMessagesToday: 0,
    totalIncomingToday: 0,
    deliverySuccessRate: 0,
    upcomingBirthdays: 0,
    messagesTrend: 0,
    successTrend: 0,
    birthdayTrend: 0,
  });
  const [messageTrends, setMessageTrends] = useState<MessageTrend[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]);
  const [schedules, setSchedules] = useState<ScheduledBroadcast[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchMessageTrends(),
        fetchRecentDeliveries(),
        fetchUpcomingBirthdays(),
        fetchSchedules()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data, error } = await supabase
        .from('scheduled_broadcasts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_time', { ascending: true })
        .limit(5);

      if (error) throw error;

      const schedulesWithCount = await Promise.all(
        (data || []).map(async (schedule) => {
          const { count } = await supabase
            .from('scheduled_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('broadcast_id', schedule.id);

          return {
            ...schedule,
            task_count: count || 0
          };
        })
      );

      setSchedules(schedulesWithCount);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: messagesToday, error: messagesError } = await supabase
        .from('message_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (messagesError) throw messagesError;

      const { count: incomingToday, error: incomingError } = await supabase
        .from('incoming_message_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (incomingError) throw incomingError;

      const { data: allMessages, error: allError } = await supabase
        .from('message_logs')
        .select('status');

      if (allError) throw allError;

      const totalMessages = allMessages?.length || 0;
      const sentMessages = allMessages?.filter(m => m.status === 'sent').length || 0;
      const successRate = totalMessages > 0 ? (sentMessages / totalMessages) * 100 : 0;

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      lastWeek.setHours(0, 0, 0, 0);

      const { count: messagesLastWeek, error: lastWeekError } = await supabase
        .from('message_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString())
        .lt('created_at', today.toISOString());

      if (lastWeekError) throw lastWeekError;

      const messagesTrend = messagesLastWeek && messagesToday 
        ? ((messagesToday - messagesLastWeek) / messagesLastWeek) * 100 
        : 0;

      const { data: birthdayData, error: birthdayError } = await supabase
        .from('patients')
        .select('id, name, date_of_birth');

      if (birthdayError) throw birthdayError;

      const upcomingCount = countUpcomingBirthdays(birthdayData || []);

      setStats({
        totalMessagesToday: messagesToday || 0,
        totalIncomingToday: incomingToday || 0,
        deliverySuccessRate: Math.round(successRate * 10) / 10,
        upcomingBirthdays: upcomingCount,
        messagesTrend: Math.round(messagesTrend),
        successTrend: 0,
        birthdayTrend: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMessageTrends = async () => {
    try {
      const trends: MessageTrend[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const { count, error } = await supabase
          .from('message_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDay.toISOString());
        
        if (error) throw error;
        
        trends.push({
          day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          messages: count || 0,
          date: date
        });
      }
      
      setMessageTrends(trends);
    } catch (error) {
      console.error('Error fetching message trends:', error);
    }
  };

  const fetchRecentDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('message_logs')
        .select(`
          id,
          message_type,
          message_content,
          status,
          created_at,
          patient_id,
          patients!inner (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const deliveries: RecentDelivery[] = (data || []).map((item: any) => ({
        id: item.id,
        patientName: item.patients?.name || 'Unknown',
        messageType: item.message_type,
        messageContent: item.message_content.substring(0, 50) + (item.message_content.length > 50 ? '...' : ''),
        status: item.status,
        timestamp: item.created_at,
        created_at: item.created_at
      }));

      setRecentDeliveries(deliveries);
    } catch (error) {
      console.error('Error fetching recent deliveries:', error);
    }
  };

  const fetchUpcomingBirthdays = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, date_of_birth');

      if (error) throw error;

      const birthdays = calculateUpcomingBirthdays(data || []);
      setUpcomingBirthdays(birthdays);
    } catch (error) {
      console.error('Error fetching upcoming birthdays:', error);
    }
  };

  const countUpcomingBirthdays = (patients: any[]): number => {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    return patients.filter(patient => {
      if (!patient.date_of_birth) return false;
      const birthDate = new Date(patient.date_of_birth);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      return thisYearBirthday >= today && thisYearBirthday <= next7Days;
    }).length;
  };

  const calculateUpcomingBirthdays = (patients: any[]): UpcomingBirthday[] => {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const upcoming = patients
      .filter(patient => {
        if (!patient.date_of_birth) return false;
        const birthDate = new Date(patient.date_of_birth);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        return thisYearBirthday >= today && thisYearBirthday <= next30Days;
      })
      .map(patient => {
        const birthDate = new Date(patient.date_of_birth);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const daysLeft = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: patient.id,
          name: patient.name,
          date_of_birth: patient.date_of_birth,
          daysLeft: daysLeft
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    return upcoming;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    return new Date(timestamp).toLocaleDateString('id-ID');
  };

  const getMessageTypeDisplay = (type: string) => {
    const mapping: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
      Invoice: { icon: <FileText className="h-3 w-3" />, label: "Invoice", color: "text-blue-600 bg-blue-50" },
      "Lab Result": { icon: <Activity className="h-3 w-3" />, label: "Hasil Lab", color: "text-purple-600 bg-purple-50" },
      Queue: { icon: <Clock className="h-3 w-3" />, label: "Antrian", color: "text-yellow-600 bg-yellow-50" },
      Birthday: { icon: <Calendar className="h-3 w-3" />, label: "Ulang Tahun", color: "text-pink-600 bg-pink-50" }
    };
    return mapping[type] || { icon: <MessageCircle className="h-3 w-3" />, label: type, color: "text-gray-600 bg-gray-50" };
  };

  const maxMessages = Math.max(...messageTrends.map(d => d.messages), 1);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(layoutOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayoutOrder(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const handleResetLayout = () => {
    setLayoutOrder(DEFAULT_LAYOUT_ORDER);
    localStorage.removeItem(STORAGE_KEY);
  };

  const statsCards = [
    {
      title: "Pesan Terkirim Hari Ini",
      value: stats.totalMessagesToday.toString(),
      trend: `${stats.messagesTrend > 0 ? '+' : ''}${stats.messagesTrend}%`,
      trendDirection: stats.messagesTrend >= 0 ? "up" : "down",
      trendText: "vs minggu lalu",
      icon: MessageCircle,
      onClick: () => navigate("/broadcast"),
    },
    {
      title: "Pesan Masuk Hari Ini",
      value: stats.totalIncomingToday.toString(),
      trend: "Real-time",
      trendDirection: "up",
      trendText: "dari balasan pasien",
      icon: Inbox,
      onClick: () => navigate("/inbox"),
    },
    {
      title: "Tingkat Pengiriman",
      value: `${stats.deliverySuccessRate}%`,
      trend: `${stats.successTrend > 0 ? '+' : ''}${stats.successTrend}%`,
      trendDirection: stats.successTrend >= 0 ? "up" : "down",
      trendText: "vs minggu lalu",
      icon: Activity,
    },
    {
      title: "Ulang Tahun Mendatang",
      value: stats.upcomingBirthdays.toString(),
      trend: `${stats.birthdayTrend > 0 ? '+' : ''}${stats.birthdayTrend}`,
      trendDirection: stats.birthdayTrend >= 0 ? "up" : "down",
      trendText: "dalam 30 hari",
      icon: Calendar,
    },
  ];

 
  const renderDashboardSection = (sectionId: string) => {
    switch (sectionId) {
      case "stats_grid":
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat) => (
              <Card 
                key={stat.title} 
                className={`border-border/80 shadow-sm transition-all ${
                  stat.onClick ? "hover:shadow-md cursor-pointer hover:border-primary/50" : ""
                }`}
                onClick={stat.onClick}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" aria-hidden />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trendDirection === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {stat.trendDirection === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.trendText}</p>
                  
                  {stat.title === "Ulang Tahun Mendatang" && upcomingBirthdays.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="space-y-2">
                        {upcomingBirthdays.slice(0, 3).map((birthday) => (
                          <div key={birthday.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium">{birthday.name}</span>
                            <span className="text-muted-foreground">
                              {birthday.daysLeft === 0 ? "Hari ini!" : `${birthday.daysLeft} hari lagi`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "trends_and_quickactions":
        return (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Tren Pesan
                      </CardTitle>
                      <CardDescription>
                        Volume pengiriman pesan per hari (7 hari terakhir)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between gap-2 h-64">
                      {messageTrends.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                            style={{ 
                              height: `${(data.messages / maxMessages) * 200}px`,
                              minHeight: '20px'
                            }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {data.messages} pesan
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{data.day}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total minggu ini</span>
                        <span className="font-semibold">
                          {messageTrends.reduce((sum, day) => sum + day.messages, 0)} pesan
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Rata-rata per hari</span>
                        <span className="font-semibold">
                          {Math.round(messageTrends.reduce((sum, day) => sum + day.messages, 0) / 7)} pesan
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="border-border/80 shadow-sm h-full">
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                  <CardDescription>
                    Operasi yang sering digunakan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate("/broadcast")}
                  >
                    <Send className="h-4 w-4" />
                    Kirim Broadcast Baru
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate("/inbox")}
                  >
                    <Inbox className="h-4 w-4" />
                    Cek Pesan Masuk
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate("/schedule")}
                  >
                    <Calendar className="h-4 w-4" />
                    Penjadwalan Pesan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate("/patients")}
                  >
                    <UserPlus className="h-4 w-4" />
                    Tambah Kontak Baru
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "schedule_broadcasts":
        return (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Daftar Jadwal Pesan Siaran
                  </CardTitle>
                  <CardDescription>
                    Monitoring antrian pesan yang telah dijadwalkan
                  </CardDescription>
                </div>
                <button 
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  onClick={() => navigate("/schedule")}
                >
                  Kelola Penjadwalan
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Belum ada jadwal broadcast mendatang</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judul Jadwal</TableHead>
                        <TableHead>Waktu Pelaksanaan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jumlah Pesan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.title}</TableCell>
                          <TableCell>{formatDateTime(schedule.scheduled_time)}</TableCell>
                          <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                          <TableCell>{schedule.task_count || 0} pesan</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "recent_activity":
        return (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Aktivitas Terbaru
                  </CardTitle>
                  <CardDescription>
                    Riwayat pengiriman pesan terbaru
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground">
                  Terakhir 7 hari
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeliveries.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Belum ada pengiriman pesan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Kirim broadcast pertama Anda untuk melihat aktivitas di sini
                    </p>
                  </div>
                ) : (
                  recentDeliveries.map((delivery) => {
                    const typeDisplay = getMessageTypeDisplay(delivery.messageType);
                    return (
                      <div 
                        key={delivery.id} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {delivery.status === "sent" ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">
                                {delivery.patientName}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeDisplay.color}`}>
                                {typeDisplay.icon}
                                {typeDisplay.label}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {delivery.messageContent}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(delivery.created_at)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              delivery.status === "sent" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                delivery.status === "sent" ? "bg-green-500" : "bg-red-500"
                              }`} />
                              {delivery.status === "sent" ? "Terkirim" : "Gagal"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {recentDeliveries.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <button 
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 ml-auto"
                      onClick={() => navigate("/broadcast")}
                    >
                      Lihat semua pengiriman
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan aktivitas pesan klinik Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isEditLayoutMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditLayoutMode(!isEditLayoutMode)}
            className="gap-2 text-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {isEditLayoutMode ? "Selesai Atur" : "Atur Layout"}
          </Button>

          {isEditLayoutMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetLayout}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              title="Kembalikan ke posisi awal"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Posisi
            </Button>
          )}
        </div>
      </div>

      {isEditLayoutMode && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Mode Edit Aktif:</strong> Klik dan tahan ikon gagang (tanda titik 6) lalu tarik modul ke atas/bawah untuk mengubah susunan.
          </span>
        </div>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="dashboard_droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {layoutOrder.map((sectionId, index) => (
                <Draggable
                  key={sectionId}
                  draggableId={sectionId}
                  index={index}
                  isDragDisabled={!isEditLayoutMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative transition-shadow rounded-xl ${
                        snapshot.isDragging
                          ? "shadow-2xl ring-2 ring-primary/40 bg-background z-50"
                          : ""
                      }`}
                    >
                      {isEditLayoutMode && (
                        <div
                          {...provided.dragHandleProps}
                          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center gap-1 hover:scale-105 transition-transform"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                          <span>Geser Posisi #{index + 1}</span>
                        </div>
                      )}

                      {/* MODUL CONTENT */}
                      <div className={isEditLayoutMode ? "pt-2" : ""}>
                        {renderDashboardSection(sectionId)}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}