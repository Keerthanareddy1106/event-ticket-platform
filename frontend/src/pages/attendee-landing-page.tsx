import { Button } from "../components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PublishedEventSummary, SpringBootPagination } from "@/domain/domain";
import { listPublishedEvents, searchPublishedEvents } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PublishedEventCard from "@/components/published-event-card";
import { SimplePagination } from "@/components/simple-pagination";
import NavBar from "@/components/nav-bar";

const QUICK_FILTERS = [
  { label: "All Events", query: "" },
  { label: "Music & Concerts", query: "Neon" },
  { label: "Tech & AI", query: "AI" },
  { label: "Symphony & Arts", query: "Symphony" },
  { label: "Gaming & VR", query: "Indie" },
];

const AttendeeLandingPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [publishedEvents, setPublishedEvents] = useState<
    SpringBootPagination<PublishedEventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    if (query && query.trim().length > 0) {
      queryPublishedEvents(query);
    } else {
      refreshPublishedEvents();
    }
  }, [page]);

  const refreshPublishedEvents = async () => {
    try {
      setError(undefined);
      setPublishedEvents(await listPublishedEvents(page));
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

  const queryPublishedEvents = async (searchText = query) => {
    if (!searchText || searchText.trim().length === 0) {
      await refreshPublishedEvents();
      return;
    }

    try {
      setError(undefined);
      setPublishedEvents(await searchPublishedEvents(searchText, page));
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

  const handleQuickFilter = (filterQuery: string) => {
    setQuery(filterQuery);
    setPage(0);
    if (!filterQuery) {
      refreshPublishedEvents();
    } else {
      queryPublishedEvents(filterQuery);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />

      {error && (
        <div className="container mx-auto px-4 mt-4">
          <Alert variant="destructive" className="bg-gray-900 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero */}
      <div className="container mx-auto px-4 mt-6 mb-8">
        <div className="bg-[url(/organizers-landing-hero.png)] bg-cover min-h-[240px] rounded-2xl bg-bottom md:min-h-[280px] overflow-hidden border border-gray-800 shadow-2xl">
          <div className="bg-gradient-to-r from-black/85 via-black/70 to-purple-950/60 min-h-[240px] md:min-h-[280px] p-8 md:p-14 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-medium w-fit mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Live QR-Verified Event Ticketing
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 max-w-xl">
              Find Tickets to Your Next Unforgettable Event
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-6 max-w-xl">
              Browse concerts, tech summits, and live experiences with instant
              QR code passes.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                queryPublishedEvents(query);
              }}
              className="flex gap-2 max-w-xl"
            >
              <div className="relative flex-1">
                <Input
                  className="bg-white/95 text-black pr-8 h-11"
                  placeholder="Search by event name, venue, or ticket tier..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => handleQuickFilter("")}
                    className="absolute right-2.5 top-3 text-gray-500 hover:text-black cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 h-11 px-5 cursor-pointer"
              >
                <Search className="w-4 h-4 mr-1.5" />
                Search
              </Button>
            </form>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {QUICK_FILTERS.map((f) => {
                const active = query === f.query;
                return (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => handleQuickFilter(f.query)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      active
                        ? "bg-purple-600 text-white border border-purple-400"
                        : "bg-black/60 text-gray-300 hover:text-white border border-white/15"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Published Event Cards */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {query ? `Search Results for "${query}"` : "Featured Published Events"}
          </h2>
          {publishedEvents && (
            <span className="text-xs text-gray-400">
              Showing {publishedEvents.numberOfElements} of{" "}
              {publishedEvents.totalElements} events
            </span>
          )}
        </div>

        {publishedEvents?.content?.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 rounded-xl border border-gray-800">
            <p className="text-gray-400 mb-4">
              No published events matched your search "{query}".
            </p>
            <Button
              variant="outline"
              onClick={() => handleQuickFilter("")}
              className="border-gray-700 text-white hover:bg-gray-800 cursor-pointer"
            >
              Show All Events
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {publishedEvents?.content?.map((publishedEvent) => (
              <PublishedEventCard
                publishedEvent={publishedEvent}
                key={publishedEvent.id}
              />
            ))}
          </div>
        )}
      </div>

      {publishedEvents && publishedEvents.totalPages > 1 && (
        <div className="w-full flex justify-center py-10">
          <SimplePagination
            pagination={publishedEvents}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AttendeeLandingPage;
