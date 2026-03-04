import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, ArrowRightLeft, Users, Bus, Check, CheckCheck, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  lida: boolean;
  created_at: string;
  referencia_tipo: string | null;
}

const tipoConfig: Record<string, { icon: React.ElementType; color: string }> = {
  transfer: { icon: ArrowRightLeft, color: "text-blue-500" },
  motorista: { icon: Users, color: "text-emerald-500" },
  grupo: { icon: Bus, color: "text-amber-500" },
};

export function NotificationBell({ collapsed }: { collapsed?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      fetchNotifications();

      channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 50));
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ lida: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.lida).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ lida: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const clearAll = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").delete().in("id", ids);
    setNotifications([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors">
          <Bell className="h-4 w-4" />
          {!collapsed && <span>Notificações</span>}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 left-5 h-5 min-w-[20px] px-1 text-[10px] font-bold flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-96 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Notificações</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7">
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Ler todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const config = tipoConfig[n.tipo] || tipoConfig.transfer;
                const Icon = config.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.lida && markAsRead(n.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 items-start",
                      !n.lida && "bg-primary/5"
                    )}
                  >
                    <div className={cn("mt-0.5 rounded-lg p-1.5 bg-muted", config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm truncate", !n.lida ? "font-semibold text-foreground" : "text-muted-foreground")}>
                          {n.titulo}
                        </p>
                        {!n.lida && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      {n.mensagem && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{n.mensagem}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {n.lida && <Check className="h-3.5 w-3.5 text-muted-foreground/40 mt-1 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
