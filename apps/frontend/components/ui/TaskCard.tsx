import Link from "next/link";
import { AlertCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    priority: string;
    dueDate?: string;
    assignee?: { name: string; avatarUrl?: string } | null;
    tags?: string[];
  };
}

const priorityColors: Record<string, string> = {
  LOW: "border-l-slate-300",
  MEDIUM: "border-l-blue-400",
  HIGH: "border-l-orange-400",
  URGENT: "border-l-red-500",
};

const priorityBadge: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-500",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

export function TaskCard({ task }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className={`card p-3 border-l-4 ${priorityColors[task.priority] || "border-l-slate-200"} hover:shadow-sm transition-all cursor-pointer group`}>
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors line-clamp-2">
          {task.title}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className={`badge text-[10px] ${priorityBadge[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
              <Clock className="h-3 w-3" />
              {format(new Date(task.dueDate), "d MMM", { locale: fr })}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="flex items-center gap-1 mt-2">
            <div className="h-4 w-4 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[9px] font-bold">
              {task.assignee.name.charAt(0)}
            </div>
            <span className="text-[10px] text-slate-400">{task.assignee.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
