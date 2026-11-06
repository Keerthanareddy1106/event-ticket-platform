import { useMemo } from "react";

interface RandomEventImageProps {
  seed?: string;
  className?: string;
}

const RandomEventImage: React.FC<RandomEventImageProps> = ({
  seed,
  className = "w-full h-full object-cover",
}) => {
  const imageSrc = useMemo(() => {
    if (seed) {
      let sum = 0;
      for (let i = 0; i < seed.length; i++) {
        sum += seed.charCodeAt(i);
      }
      const index = (sum % 4) + 1;
      return `/event-image-${index}.webp`;
    }
    const randomIndex = Math.floor(Math.random() * 4) + 1;
    return `/event-image-${randomIndex}.webp`;
  }, [seed]);

  return <img src={imageSrc} alt="Event cover" className={className} />;
};

export default RandomEventImage;
