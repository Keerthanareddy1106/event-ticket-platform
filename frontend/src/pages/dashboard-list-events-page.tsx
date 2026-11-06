import NavBar from "@/components/nav-bar";
import { SimplePagination } from "@/components/simple-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useAppAuth } from "@/context/demo-auth-context";
import {
  EventSummary,
  EventStatusEnum,
  SpringBootPagination,
} from "@/domain/domain";
import { deleteEvent, listEvents } from "@/lib/api";
import { getDemoEventsRaw, getDemoTicketsRaw } from "@/lib/demo-store";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Plus,
  Tag,
  Ticket,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

const DashboardListEventsPage: React.FC = () => {
  const { isLoading, user } = useAppAuth();
  const [events, setEvents] = useState<
    SpringBootPagination<EventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [deleteEventError, setDeleteEventError] = useState<
    string | undefined
  >();

  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<
    EventSummary | undefined
  >();

  useEffect(() => {
    if (isLoading || !user?.access_token) {
      return;
    }
    refreshEvents(user.access_token);
  }, [isLoading, user?.access_token, page]);

  const refreshEvents = async (accessToken: string) => {
    try {
      setError(undefined);
      setEvents(await listEvents(accessToken, page));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unknown error has occurred");
      }
    }
  };

  const stats = useMemo(() => {
    const allEvents = getDemoEventsRaw();
    const allTickets = getDemoTicketsRaw();
    const publishedCount = allEvents.filter(
      (e) => e.status === EventStatusEnum.PUBLISHED,
    ).length;
    const totalCapacity = allEvents.reduce(
      (sum, ev) =>
        sum +
        ev.ticketTypes.reduce((acc, tt) => acc + (tt.totalAvailable || 0), 0),
      0,
    );
    const ticketsSold = allTickets.length;
    const revenueGenerated = allTickets.reduce((sum, t) => sum + t.price, 0);
    return {
      totalEvents: events?.totalElements ?? allEvents.length,
      publishedCount,
      totalCapacity,
      ticketsSold,
      revenueGenerated,
    };
  }, [events]);

  const formatDate = (date?: Date) => {
    if (!date) {
      return "TBD";
    }
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date?: Date) => {
    if (!date) {
      return "";
    }
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatusBadge = (status: EventStatusEnum) => {
    switch (status) {
      case EventStatusEnum.DRAFT:
        return "bg-gray-700 text-gray-200";
      case EventStatusEnum.PUBLISHED:
        return "bg-green-700 text-green-100";
      case EventStatusEnum.CANCELLED:
        return "bg-red-700 text-red-100";
      case EventStatusEnum.COMPLETED:
        return "bg-blue-700 text-blue-100";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const handleOpenDeleteEventDialog = (eventToDelete: EventSummary) => {
    setEventToDelete(eventToDelete);
    setDialogOpen(true);
  };

  const handleCancelDeleteEventDialog = () => {
    setEventToDelete(undefined);
    setDialogOpen(false);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || isLoading || !user?.access_token) {
      return;
    }

    try {
      setDeleteEventError(undefined);
      await deleteEvent(user.access_token, eventToDelete.id);
      setEventToDelete(undefined);
      setDialogOpen(false);
      refreshEvents(user.access_token);
    } catch (err) {
      if (err instanceof Error) {
        setDeleteEventError(err.message);
      } else if (typeof err === "string") {
        setDeleteEventError(err);
      } else {
        setDeleteEventError("An unknown error has occurred");
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <Alert variant="destructive" className="bg-gray-900 border-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Organizer Event Hub
            </h1>
            <p className="text-gray-400 text-sm">
              Manage your events, ticket tiers, and real-time capacity
            </p>
          </div>
          <Link to="/dashboard/events/create">
            <Button className="bg-purple-600 hover:bg-purple-500 cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Organizer Analytics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Total Events</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{stats.totalEvents}</p>
            <p className="text-xs text-green-400 mt-0.5">
              {stats.publishedCount} Published Live
            </p>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Tickets Sold</span>
              <Ticket className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{stats.ticketsSold}</p>
            <p className="text-xs text-gray-400 mt-0.5">Active QR passes</p>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              ${stats.revenueGenerated.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">From issued tickets</p>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Remaining Capacity</span>
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">
              {stats.totalCapacity.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Across all tiers</p>
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events?.content.map((eventItem) => (
            <Card
              key={eventItem.id}
              className="bg-gray-900 border-gray-800 text-white flex flex-col justify-between"
            >
              <div>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg leading-snug">
                      {eventItem.name}
                    </h3>
                    <span
                      className={`shrink-0 flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formatStatusBadge(eventItem.status)}`}
                    >
                      {eventItem.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {/* Event Start & End */}
                  <div className="flex space-x-2.5">
                    <Calendar className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {formatDate(eventItem.start)} to{" "}
                        {formatDate(eventItem.end)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(eventItem.start)} -{" "}
                        {formatTime(eventItem.end)}
                      </p>
                    </div>
                  </div>
                  {/* Sales start and end */}
                  <div className="flex space-x-2.5">
                    <Clock className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-xs text-gray-300">
                        Sales Window
                      </h4>
                      <p className="text-xs text-gray-400">
                        {formatDate(eventItem.salesStart)} to{" "}
                        {formatDate(eventItem.salesEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2.5">
                    <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <p className="font-medium text-gray-200">
                      {eventItem.venue}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <Tag className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <div className="w-full">
                      <h4 className="font-medium text-xs text-gray-300 mb-1">
                        Ticket Tiers ({eventItem.ticketTypes.length})
                      </h4>
                      <ul className="space-y-1">
                        {eventItem.ticketTypes.map((ticketType) => (
                          <li
                            key={ticketType.id}
                            className="flex justify-between text-xs bg-gray-800/70 px-2.5 py-1 rounded text-gray-300"
                          >
                            <span>{ticketType.name}</span>
                            <span className="font-semibold text-purple-300">
                              ${ticketType.price}
                              {ticketType.totalAvailable !== undefined
                                ? ` (${ticketType.totalAvailable} left)`
                                : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="flex justify-between gap-2 border-t border-gray-800/80 pt-3">
                {eventItem.status === EventStatusEnum.PUBLISHED ? (
                  <Link to={`/events/${eventItem.id}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-purple-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Public Page
                    </Button>
                  </Link>
                ) : (
                  <span className="text-xs text-gray-500">Draft mode</span>
                )}
                <div className="flex gap-2">
                  <Link to={`/dashboard/events/update/${eventItem.id}`}>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-gray-800 hover:bg-gray-700 cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-red-700/80 hover:bg-red-600 cursor-pointer"
                    onClick={() => handleOpenDeleteEventDialog(eventItem)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-center py-8">
        {events && events.totalPages > 1 && (
          <SimplePagination pagination={events} onPageChange={setPage} />
        )}
      </div>
      <AlertDialog open={dialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will delete your event '{eventToDelete?.name}' and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteEventError && (
            <Alert variant="destructive" className="border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{deleteEventError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              onClick={handleCancelDeleteEventDialog}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={() => handleDeleteEvent()}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardListEventsPage;
