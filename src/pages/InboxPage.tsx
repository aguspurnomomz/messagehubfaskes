import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  User,
  Phone,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface IncomingMessage {
  id: string;
  patient_id: string | null;
  sender_number: string;
  sender_name: string | null;
  message_content: string;
  fonnte_device: string | null;
  created_at: string;
  patients?: {
    name: string;
    phone_number: string;
  } | null;
}

export function InboxPage() {
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<IncomingMessage | null>(null);

  const fetchIncomingMessages = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("incoming_message_logs")
        .select(`
          id,
          patient_id,
          sender_number,
          sender_name,
          message_content,
          fonnte_device,
          created_at,
          patients ( name, phone_number )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData = data as unknown as IncomingMessage[];
        setMessages(formattedData);
        if (formattedData.length > 0 && !selectedMessage) {
          setSelectedMessage(formattedData[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching incoming messages:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncomingMessages();

    // Setup Realtime Listener Supabase
    const channel = supabase
      .channel("realtime_incoming_inbox")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incoming_message_logs" },
        () => {
          fetchIncomingMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter pencarian berdasarkan nama pasien, nomor WA, atau isi pesan
  const filteredMessages = messages.filter((msg) => {
    const patientName = msg.patients?.name || msg.sender_name || "";
    const query = searchQuery.toLowerCase();
    return (
      patientName.toLowerCase().includes(query) ||
      msg.sender_number.includes(query) ||
      msg.message_content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Pesan Masuk</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar balasan dan pesan WhatsApp yang masuk secara real time
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchIncomingMessages(true)}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, nomor WA, atau isi pesan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-12 px-4 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Belum ada pesan masuk</p>
                  <p className="text-xs mt-1">
                    Pesan balasan dari pasien akan otomatis muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredMessages.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    const displayName = msg.patients?.name || msg.sender_name || "Pasien Baru";
                    const isRegistered = !!msg.patients?.name;

                    return (
                      <button
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className={`w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-muted/50 ${
                          isSelected ? "bg-muted border-l-4 border-l-primary" : ""
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                            isRegistered
                              ? "bg-primary/10 text-primary"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm truncate text-foreground">
                              {displayName}
                            </span>
                            <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                              {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                            {msg.message_content}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            {selectedMessage ? (
              <>
                <CardHeader className="border-b pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedMessage.patients?.name ||
                            selectedMessage.sender_name ||
                            "Pasien Belum Terdaftar"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedMessage.sender_number}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(selectedMessage.created_at).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>

                    {selectedMessage.patients?.name ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                        <CheckCircle2 className="h-3 w-3" /> Pasien Terdaftar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                        <HelpCircle className="h-3 w-3" /> Kontak Baru
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                  <div className="space-y-4">
                    <div className="text-xs text-center text-muted-foreground my-2">
                      Pesan diterima pada{" "}
                      {new Date(selectedMessage.created_at).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-border space-y-2">
                        <div className="text-xs font-semibold text-primary">
                          {selectedMessage.patients?.name ||
                            selectedMessage.sender_name ||
                            selectedMessage.sender_number}
                        </div>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap break-words leading-relaxed">
                          {selectedMessage.message_content}
                        </p>
                        <div className="text-[10px] text-slate-400 text-right">
                          {new Date(selectedMessage.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium">Pilih pesan di sebelah kiri</p>
                  <p className="text-xs mt-1">
                    Detail isi balasan pesan pasien akan muncul di panel ini.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}