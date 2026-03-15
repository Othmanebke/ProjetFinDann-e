import { clsx } from "clsx";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "primary" | "green" | "red" | "blue" | "orange";
  trend?: string;
  trendUp?: boolean;
}

const colorMap = {
  primary: "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400",
  green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
};

export function KPICard({ title, value, icon, color, trend, trendUp }: KPICardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend && (
            <p className={clsx(
              "mt-1 text-xs",
              trendUp === true ? "text-green-600" : trendUp === false ? "text-red-500" : "text-slate-400"
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", colorMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
