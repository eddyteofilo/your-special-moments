import { useEffect, useState } from "react";

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-6 text-gold">
      <TimeUnit value={timeLeft.days} label="DIAS" />
      <TimeUnit value={timeLeft.hours} label="HORAS" />
      <TimeUnit value={timeLeft.minutes} label="MIN" />
      <TimeUnit value={timeLeft.seconds} label="SEG" />
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-display text-3xl font-light tracking-tighter sm:text-4xl">
      {value.toString().padStart(2, "0")}
    </span>
    <span className="mt-1 font-display text-[10px] tracking-widest text-gold/60">{label}</span>
  </div>
);

export default Countdown;
