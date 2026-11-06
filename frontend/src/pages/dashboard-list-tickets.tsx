import NavBar from "@/components/nav-bar";
import { SimplePagination } from "@/components/simple-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppAuth } from "@/context/demo-auth-context";
import { SpringBootPagination, TicketSummary } from "@/domain/domain";
import { listTickets } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  DollarSign,
  QrCode,
  Tag,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const DashboardListTickets: React.FC = () => {
  const { isLoading, user } = useAppAuth();

  const [tickets, setTickets] = useState<
    SpringBootPagination<TicketSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (isLoading || !user?.access_token) {
      return;
    }

    const doUseEffect = async () => {
      try {
        setError(undefined);
        setTickets(await listTickets(user.access_token, page));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "string") {
          setError(err);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    doUseEffect();
  }, [isLoading, user?.access_token, page]);

  if (error) {
    return (
      <div className="bg-black min-h-screen text-white">
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Ticket Wallet</h1>
            <p className="text-gray-400 text-sm">
              Click any ticket to view its scannable venue QR pass
            </p>
          </div>
          <Link to="/">
            <Button
              variant="outline"
              className="border-gray-700 bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
            >
              Browse More Events
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {tickets?.content.map((ticketItem) => (
            <Link
              key={ticketItem.id}
              to={`/dashboard/tickets/${ticketItem.id}`}
              className="block group"
            >
              <Card className="bg-gray-900 border-gray-800 hover:border-purple-500/60 text-white transition">
                <CardHeader>
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2.5">
                      <Ticket className="h-5 w-5 text-purple-400 shrink-0" />
                      <h3 className="font-bold text-lg group-hover:text-purple-300 transition">
                        {ticketItem.ticketType.name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                      {ticketItem.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-between items-center gap-4">
                  <div className="space-y-1.5">
                    {/* Price */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-purple-400" />
                      <p className="font-semibold">
                        ${ticketItem.ticketType.price}
                      </p>
                    </div>

                    {/* Ticket ID */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Tag className="h-4 w-4 text-purple-400" />
                      <span className="font-mono">{ticketItem.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-purple-300 bg-purple-950/50 border border-purple-500/30 px-3 py-2 rounded-lg">
                    <QrCode className="w-4 h-4" />
                    <span>Open QR Pass</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex justify-center py-8">
          {tickets && tickets.totalPages > 1 && (
            <SimplePagination pagination={tickets} onPageChange={setPage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardListTickets;
