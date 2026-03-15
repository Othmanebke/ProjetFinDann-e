import Link from "next/link";
import { FolderOpen, Users, CheckSquare, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: string;
    color: string;
    owner: { name: string; avatarUrl?: string };
    members: any[];
    _count: { tasks: number };
    updatedAt: string;
  };
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  ON_HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="card p-5 group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
              {project.name}
            </h3>
          </div>
          <span className={`badge text-xs flex-shrink-0 ${statusColors[project.status] || "bg-slate-100 text-slate-600"}`}>
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              {project._count.tasks} tâches
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.members.length}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: fr })}</span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Link>
  );
}
