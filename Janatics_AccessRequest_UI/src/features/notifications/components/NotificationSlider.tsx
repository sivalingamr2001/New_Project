import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/shared/components/ui/sheet";
import { Spinner } from "@/shared/components/ui/spinner";
import { notificationApi, type NotificationDto } from "@/features/notifications/api/notificationsApi";

export function NotificationSlider() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    void loadUnreadCount();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadNotifications();
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await notificationApi.getNotifications(1, 20);
      setNotifications(result.data);
      setUnreadCount(result.data.filter((item) => !item.isRead).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b border-border px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  Latest system notifications and access request updates.
                </SheetDescription>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <span className="sr-only">Close</span>
                  ×
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Spinner />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-2xl border border-border/80 bg-muted p-6 text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification.id)}
                    className="w-full text-left rounded-3xl border border-border/70 bg-card p-4 shadow-sm transition hover:border-primary/70"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2">
                      <span className="text-sm font-semibold text-foreground">
                        {notification.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em] ${
                          notification.isRead
                            ? "bg-muted text-muted-foreground"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{notification.type}</span>
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border/70 p-4">
            <Link to="/notifications" className="text-sm font-medium text-primary hover:underline">
              View all notifications
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
