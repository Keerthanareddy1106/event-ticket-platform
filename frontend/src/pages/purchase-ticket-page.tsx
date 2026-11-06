import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppAuth } from "@/context/demo-auth-context";
import { PublishedEventDetails } from "@/domain/domain";
import { getPublishedEvent, purchaseTicket } from "@/lib/api";
import { CheckCircle, CreditCard, Lock, Sparkles, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

const PurchaseTicketPage: React.FC = () => {
  const { eventId, ticketTypeId } = useParams();
  const { isLoading, user } = useAppAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const [isPurchaseSuccess, setIsPurchaseASuccess] = useState(false);
  const [eventDetails, setEventDetails] = useState<
    PublishedEventDetails | undefined
  >();
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardHolder, setCardHolder] = useState("Jamie Chen (Demo)");

  useEffect(() => {
    if (eventId) {
      getPublishedEvent(eventId)
        .then(setEventDetails)
        .catch(() => undefined);
    }
  }, [eventId]);

  useEffect(() => {
    if (!isPurchaseSuccess) {
      return;
    }
    const timer = setTimeout(() => {
      navigate("/dashboard/tickets");
    }, 3500);

    return () => clearTimeout(timer);
  }, [isPurchaseSuccess, navigate]);

  const selectedTier = eventDetails?.ticketTypes.find(
    (t) => t.id === ticketTypeId,
  );

  const handlePurchase = async () => {
    if (isLoading || !user?.access_token || !eventId || !ticketTypeId) {
      return;
    }
    try {
      setError(undefined);
      await purchaseTicket(user.access_token, eventId, ticketTypeId);
      setIsPurchaseASuccess(true);
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

  if (isPurchaseSuccess) {
    return (
      <div className="bg-black min-h-screen text-white">
        <NavBar />
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="bg-gray-900 p-8 rounded-2xl border border-green-500/40 shadow-2xl text-white space-y-4">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold text-green-400">
              Ticket Confirmed!
            </h2>
            <p className="text-gray-300 text-sm">
              Your QR pass for{" "}
              <span className="font-semibold text-white">
                {eventDetails?.name || "the event"}
              </span>{" "}
              has been issued to your wallet.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/dashboard/tickets">
                <Button className="w-full bg-purple-600 hover:bg-purple-500 cursor-pointer">
                  <Ticket className="w-4 h-4 mr-2" />
                  View Ticket & QR Code Now
                </Button>
              </Link>
              <p className="text-gray-500 text-xs">
                Redirecting to My Tickets automatically...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-gray-900 border-gray-800 shadow-xl border rounded-2xl space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <span className="text-xs text-purple-400 font-semibold uppercase">
                Instant Checkout
              </span>
              <h1 className="text-xl font-bold text-white">
                {eventDetails?.name || "Complete Ticket Purchase"}
              </h1>
              {selectedTier && (
                <p className="text-sm text-gray-400">
                  {selectedTier.name} —{" "}
                  <span className="text-white font-semibold">
                    ${selectedTier.price}
                  </span>
                </p>
              )}
            </div>
            <Lock className="w-5 h-5 text-green-400" />
          </div>

          {error && (
            <div className="border border-red-500/40 rounded-lg p-3 bg-red-950/50">
              <div className="text-red-300 text-sm">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Credit Card Number */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">Credit Card Number</Label>
              <button
                type="button"
                onClick={() => {
                  setCardNumber("4242 4242 4242 4242");
                  setCardHolder("Recruiter Demo User");
                }}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Auto-fill demo card
              </button>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="bg-gray-800 border-gray-700 text-white pl-10"
              />
              <CreditCard className="absolute h-4 w-4 text-gray-400 top-2.5 left-3" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Cardholder Name</Label>
            <div className="relative">
              <Input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="John Smith"
                className="bg-gray-800 border-gray-700 text-white pl-10"
              />
              <CreditCard className="absolute h-4 w-4 text-gray-400 top-2.5 left-3" />
            </div>
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-500 h-11 font-semibold cursor-pointer"
            onClick={handlePurchase}
          >
            Confirm & Issue QR Ticket{" "}
            {selectedTier ? `($${selectedTier.price})` : ""}
          </Button>

          <div className="text-gray-400 text-xs text-center">
            Sandbox checkout — no real payment details required.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTicketPage;
