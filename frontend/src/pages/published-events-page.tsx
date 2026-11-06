import NavBar from "@/components/nav-bar";
import RandomEventImage from "@/components/random-event-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  PublishedEventDetails,
  PublishedEventTicketTypeDetails,
} from "@/domain/domain";
import { getPublishedEvent } from "@/lib/api";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const PublishedEventsPage: React.FC = () => {
  const { id } = useParams();
  const [error, setError] = useState<string | undefined>();
  const [publishedEvent, setPublishedEvent] = useState<
    PublishedEventDetails | undefined
  >();
  const [selectedTicketType, setSelectedTicketType] = useState<
    PublishedEventTicketTypeDetails | undefined
  >();

  useEffect(() => {
    if (!id) {
      setError("ID must be provided!");
      return;
    }

    const doUseEffect = async () => {
      try {
        setError(undefined);
        const eventData = await getPublishedEvent(id);
        setPublishedEvent(eventData);
        if (eventData.ticketTypes.length > 0) {
          setSelectedTicketType(eventData.ticketTypes[0]);
        }
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
    doUseEffect();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="bg-gray-900 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all events
        </Link>

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 md:p-8">
          {/* Left Column */}
          <div className="space-y-4 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-medium w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Event • Instant QR Delivery
            </span>
            <h1 className="text-3xl md:text-4xl font-bold">
              {publishedEvent?.name}
            </h1>
            <p className="text-base flex items-center gap-2 text-gray-300">
              <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
              {publishedEvent?.venue}
            </p>
            {publishedEvent?.start && (
              <p className="text-sm flex items-center gap-2 text-gray-400">
                <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                <span>
                  {format(new Date(publishedEvent.start), "PPP p")}
                  {publishedEvent.end
                    ? ` – ${format(new Date(publishedEvent.end), "PPP p")}`
                    : ""}
                </span>
              </p>
            )}
          </div>
          {/* Right Column */}
          <div className="bg-gray-800 rounded-xl w-full h-[240px] overflow-hidden md:ml-auto">
            <RandomEventImage seed={publishedEvent?.id} />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-purple-400" />
          Select Your Ticket Tier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Ticket Type List */}
          <div className="space-y-3">
            {publishedEvent?.ticketTypes?.map((ticketType) => {
              const isSelected = selectedTicketType?.id === ticketType.id;
              return (
                <Card
                  className={`cursor-pointer gap-0 transition border ${
                    isSelected
                      ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-950/30"
                      : "bg-gray-900 border-gray-800 hover:bg-gray-800/80 text-white"
                  }`}
                  key={ticketType.id}
                  onClick={() => setSelectedTicketType(ticketType)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        {ticketType.name}
                      </h3>
                      <span className="text-xl font-bold text-purple-300">
                        ${ticketType.price}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">
                      {ticketType.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right: Selected Ticket Checkout Summary */}
          <div className="text-white">
            {selectedTicketType && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-20 space-y-5">
                <div>
                  <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">
                    Selected Pass
                  </span>
                  <h2 className="text-2xl font-bold mt-1">
                    {selectedTicketType.name}
                  </h2>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">
                    ${selectedTicketType.price}
                  </span>
                  <span className="text-xs text-gray-400">
                    / ticket (no hidden fees)
                  </span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedTicketType.description}
                </p>

                <div className="border-t border-gray-800 pt-4 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span>Generates a unique scannable QR code immediately</span>
                  </div>
                </div>

                <Link
                  to={`/events/${publishedEvent?.id}/purchase/${selectedTicketType?.id}`}
                  className="block"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 h-11 text-base font-semibold cursor-pointer">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublishedEventsPage;
