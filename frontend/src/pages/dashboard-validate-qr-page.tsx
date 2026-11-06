import NavBar from "@/components/nav-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppAuth } from "@/context/demo-auth-context";
import {
  TicketValidationMethod,
  TicketValidationStatus,
} from "@/domain/domain";
import { validateTicket } from "@/lib/api";
import { getDemoTicketsRaw, StoredTicket } from "@/lib/demo-store";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  AlertCircle,
  Check,
  QrCode,
  RotateCcw,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const DashboardValidateQrPage: React.FC = () => {
  const { isLoading, user } = useAppAuth();
  const [searchParams] = useSearchParams();
  const [isManual, setIsManual] = useState(false);
  const [data, setData] = useState<string>("");
  const [error, setError] = useState<string | undefined>();
  const [validationStatus, setValidationStatus] = useState<
    TicketValidationStatus | undefined
  >();
  const [sampleTickets, setSampleTickets] = useState<StoredTicket[]>(() =>
    getDemoTicketsRaw(),
  );

  useEffect(() => {
    const presetTicketId = searchParams.get("ticketId");
    if (presetTicketId && user?.access_token) {
      setIsManual(true);
      setData(presetTicketId);
      handleValidate(presetTicketId, TicketValidationMethod.MANUAL);
    }
  }, [searchParams, user?.access_token]);

  const handleReset = () => {
    setIsManual(false);
    setData("");
    setError(undefined);
    setValidationStatus(undefined);
    setSampleTickets(getDemoTicketsRaw());
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === "string") {
      setError(err);
    } else {
      setError("An unknown error occurred");
    }
  };

  const handleValidate = async (id: string, method: TicketValidationMethod) => {
    if (!user?.access_token || !id.trim()) {
      return;
    }
    try {
      setError(undefined);
      const response = await validateTicket(user.access_token, {
        id: id.trim(),
        method,
      });
      setValidationStatus(response.status);
      setSampleTickets(getDemoTicketsRaw());
    } catch (err) {
      handleError(err);
    }
  };

  if (isLoading || !user?.access_token) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <p className="p-8 text-center text-gray-400">Loading scanner...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6 text-purple-400" />
            Organizer Ticket QR Validator
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Scan attendee QR codes with your camera or validate Ticket IDs
            manually. Single-use redemption is strictly enforced.
          </p>
        </div>

        <div className="border border-gray-800 bg-gray-900/90 rounded-2xl p-6 shadow-2xl space-y-5">
          {error && (
            <Alert variant="destructive" className="bg-gray-950 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Notice</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Scanner Viewport */}
          <div className="rounded-xl overflow-hidden mx-auto relative border border-gray-700 bg-black aspect-square max-w-[280px]">
            <Scanner
              key={`scanner-${data}-${validationStatus}`}
              onScan={(result) => {
                if (result && result.length > 0) {
                  const qrCodeId = result[0].rawValue;
                  setData(qrCodeId);
                  handleValidate(qrCodeId, TicketValidationMethod.QR_SCAN);
                }
              }}
              onError={() => {
                // Camera optional in desktop browser
              }}
            />

            {validationStatus && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                {validationStatus === TicketValidationStatus.VALID ? (
                  <>
                    <div className="bg-green-500 rounded-full p-4 mb-3 shadow-lg shadow-green-500/40">
                      <Check className="w-14 h-14 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-400">
                      VALID TICKET — REDEEMED
                    </h3>
                    <p className="text-xs text-gray-300 font-mono mt-1">
                      {data}
                    </p>
                    <p className="text-xs text-green-200 mt-1">
                      Ticket verified and marked as redeemed. Scanning again
                      will reject duplicate entry.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-red-500 rounded-full p-4 mb-3 shadow-lg shadow-red-500/40">
                      <X className="w-14 h-14 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-red-400">
                      {validationStatus} TICKET
                    </h3>
                    <p className="text-xs text-gray-300 font-mono mt-1">
                      {data}
                    </p>
                    <p className="text-xs text-red-200 mt-1">
                      Entry denied — ticket has already been redeemed or ID is
                      unrecognized.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {isManual ? (
            <div className="space-y-3">
              <Input
                className="w-full bg-gray-800 border-gray-700 text-white font-mono"
                placeholder="Enter Ticket ID (e.g. TKT-8842-NEON-VIP)"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
              <Button
                className="bg-purple-600 w-full h-12 hover:bg-purple-500 font-semibold cursor-pointer"
                onClick={() =>
                  handleValidate(data || "", TicketValidationMethod.MANUAL)
                }
              >
                Verify Ticket ID
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-gray-700 bg-gray-950 border h-11 rounded-lg font-mono text-sm flex justify-center items-center text-gray-300">
                <span>{data || "Ready to scan QR or enter ID"}</span>
              </div>
              <Button
                className="bg-gray-800 hover:bg-gray-700 border-gray-700 border w-full h-12 text-base cursor-pointer"
                onClick={() => setIsManual(true)}
              >
                Enter Ticket ID Manually
              </Button>
            </div>
          )}

          {/* Sample Ticket Verification Helper */}
          <div className="border-t border-gray-800 pt-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Test Attendee Tickets (Click twice to test duplicate prevention):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleTickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setIsManual(true);
                    setData(t.id);
                    handleValidate(t.id, TicketValidationMethod.MANUAL);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono flex items-center gap-1.5 cursor-pointer transition ${
                    t.redeemed
                      ? "bg-amber-950/60 hover:bg-amber-900/70 border-amber-500/40 text-amber-200"
                      : "bg-green-950/60 hover:bg-green-900/70 border-green-500/40 text-green-200"
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>
                    {t.id} ({t.redeemed ? "Already Redeemed" : "Unredeemed"})
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const fakeId = "TKT-0000-COUNTERFEIT";
                  setIsManual(true);
                  setData(fakeId);
                  handleValidate(fakeId, TicketValidationMethod.MANUAL);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-200 font-mono flex items-center gap-1.5 cursor-pointer transition"
              >
                <X className="w-3.5 h-3.5 text-red-400" />
                <span>Test Invalid Ticket</span>
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            className="bg-gray-950 hover:bg-gray-800 border-gray-700 text-gray-300 w-full h-11 cursor-pointer"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Scanner Display
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardValidateQrPage;
