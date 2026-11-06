import { PublishedEventSummary } from "@/domain/domain";
import { Card } from "./ui/card";
import { ArrowRight, Calendar, Check, Heart, MapPin, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";
import RandomEventImage from "./random-event-image";
import { useState } from "react";

interface PublishedEventCardProperties {
  publishedEvent: PublishedEventSummary;
}

const WISHLIST_KEY = "etp_wishlist_ids";

function getWishlistIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

const PublishedEventCard: React.FC<PublishedEventCardProperties> = ({
  publishedEvent,
}) => {
  const [liked, setLiked] = useState<boolean>(() =>
    getWishlistIds().includes(publishedEvent.id),
  );
  const [copied, setCopied] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = getWishlistIds();
    const next = current.includes(publishedEvent.id)
      ? current.filter((id) => id !== publishedEvent.id)
      : [...current, publishedEvent.id];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setLiked(next.includes(publishedEvent.id));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${publishedEvent.id}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Link to={`/events/${publishedEvent.id}`} className="block group">
      <Card className="py-0 overflow-hidden bg-gray-900 border-gray-800 hover:border-purple-500/60 text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/30 flex flex-col justify-between h-full">
        <div>
          {/* Card Image */}
          <div className="h-[165px] relative overflow-hidden">
            <RandomEventImage
              seed={publishedEvent.id}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
              <button
                type="button"
                onClick={toggleLike}
                title={liked ? "Remove from saved" : "Save event"}
                className={`p-1.5 rounded-full backdrop-blur-md border transition cursor-pointer ${
                  liked
                    ? "bg-pink-500/90 border-pink-400 text-white"
                    : "bg-black/50 border-white/20 text-gray-200 hover:text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                title="Copy event link"
                className="p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-gray-200 hover:text-white transition cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-2.5">
            <h3 className="text-lg font-bold leading-snug group-hover:text-purple-300 transition line-clamp-2">
              {publishedEvent.name}
            </h3>

            <div className="flex items-start gap-2 text-xs text-gray-400">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{publishedEvent.venue}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              {publishedEvent.start ? (
                <span>{format(new Date(publishedEvent.start), "EEE, MMM d, yyyy")}</span>
              ) : (
                <span>Dates TBD</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-800/80 flex items-center justify-between text-xs font-medium text-purple-300 group-hover:text-purple-200">
          <span>View Tickets & Details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
};

export default PublishedEventCard;
