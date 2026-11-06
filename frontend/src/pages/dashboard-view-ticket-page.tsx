import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/context/demo-auth-context";
import { TicketDetails, TicketStatus } from "@/domain/domain";
import { getTicket, getTicketQr } from "@/lib/api";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  DollarSign,
  MapPin,
  QrCode,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

const DashboardViewTicketPage: React.FC = () => {
  const [ticket, setTicket] = useState<TicketDetails | undefined>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>();
  const [isQrLoading, setIsQrCodeLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  const { id } = useParams();
  const { isLoading, user } = useAppAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user?.access_token || !id) {
      return;
    }

    let createdUrl: string | undefined;

    const doUseEffect = async (accessToken: string, ticketId: string) => {
      try {
        setIsQrCodeLoading(true);
        setError(undefined);

        setTicket(await getTicket(accessToken, ticketId));
        const blob = await getTicketQr(accessToken, ticketId);
        createdUrl = URL.createObjectURL(blob);
        setQrCodeUrl(createdUrl);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("An unknown error has occurred");
        }
      } finally {
        setIsQrCodeLoading(false);
      }
    };

    doUseEffect(user.access_token, id);

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [user?.access_token, isLoading, id]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PURCHASED:
        return "text-green-400";
      case TicketStatus.CANCELLED:
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const handleCopyId = () => {
    if (!ticket) return;
    navigator.clipboard?.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!ticket) {
    return (
      <div className="bg-black min-h-screen text-white">
        <NavBar />
        <div className="p-8 text-center text-gray-400">Loading ticket...</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />
      <div className="flex flex-col items-center justify-center p-4 py-10">
        <div className="w-full max-w-md">
          <Link
            to="/dashboard/tickets"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Tickets
          </Link>

          <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-purple-500/30">
            {/* Status */}
            <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full mb-6 text-center">
              <span
                className={`text-sm font-semibold ${getStatusColor(ticket.status)}`}
              >
                {ticket.status}
              </span>
            </div>

            <div className="mb-3">
              <h1 className="text-2xl font-bold mb-2">{ticket.eventName}</h1>
              <div className="flex items-center gap-2 text-purple-200 text-sm">
                <MapPin className="w-4 shrink-0" />
                <span>{ticket.eventVenue}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-purple-300 mb-6 text-xs">
              <Calendar className="w-4 text-purple-200 shrink-0" />
              <div>
                {ticket.eventStart
                  ? format(new Date(ticket.eventStart), "Pp")
                  : "N/A"}{" "}
                -{" "}
                {ticket.eventEnd
                  ? format(new Date(ticket.eventEnd), "Pp")
                  : "N/A"}
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="w-44 h-44 flex items-center justify-center">
                  {isQrLoading && (
                    <div className="text-xs text-center p-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2 mx-auto"></div>
                      <div className="text-gray-800">Loading QR...</div>
                    </div>
                  )}
                  {error && (
                    <div className="text-red-400 text-sm text-center p-2">
                      <div className="mb-1">⚠️</div>
                      {error}
                    </div>
                  )}
                  {qrCodeUrl && !isQrLoading && !error && (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for event"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-purple-200 text-xs">
                Present this QR code at the venue gate for instant verification
              </p>
            </div>

            <div className="space-y-2 mb-6 bg-black/25 p-4 rounded-xl text-sm">
              <div className="flex items-start gap-2">
                <Tag className="w-4 text-purple-200 shrink-0 mt-0.5" />
                <span className="font-medium">{ticket.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 text-purple-200 shrink-0" />
                <span className="font-semibold">${ticket.price}</span>
              </div>
            </div>

            <div className="text-center mb-4">
              <h4 className="text-xs uppercase tracking-wider text-purple-300 font-semibold">
                Ticket Verification ID
              </h4>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-white text-sm font-mono bg-black/30 px-3 py-1 rounded-md">
                  {ticket.id}
                </p>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 rounded-md bg-black/30 hover:bg-black/50 text-purple-200 cursor-pointer"
                  title="Copy Ticket ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  `/dashboard/validate-qr?ticketId=${encodeURIComponent(ticket.id)}`,
                )
              }
              className="w-full bg-black/40 hover:bg-black/60 border border-purple-400/40 text-white cursor-pointer"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Test Validate This Ticket at Gate Scanner
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardViewTicketPage;
