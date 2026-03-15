"use client";

import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckSquare, FolderOpen, UserPlus, Zap } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "task.created": <CheckSquare className="h-3.5 w-3.5 text-blue-500" />,
  "task.updated": <CheckSquare className="h-3.5 w-3.5 text-green-500" />,
  "project.created": <FolderOpen className="h-3.5 w-3.5 text-primary-500" />,
  "project.updated": <FolderOpen className="h-3.5 w-3.5 text-orange-500" />,
  "member.added": <UserPlus className="h-3.5 w-3.5 text-purple-500" />,
};

export function RecentActivity() {
  const { data: projects } = useSWR("/projects?limit=5");

  // Use first project's activity or show placeholder
  const firstProjectId = projects?.data?.[0]?.id;
  const { data: stats } = useSWR(firstProjectId ? `/projects/${firstProjectId}/stats` : null);

  const activities = stats?.recentActivity || [];

  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Zap className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-xs">Aucune activité récente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {activities.map((activity: any) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0">
            {iconMap[activity.action] || <Zap className="h-3.5 w-3.5 text-slate-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-medium">{activity.user?.name}</span>{" "}
              {activity.action.replace(".", " ")}
            </p>
            <p className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: fr })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
