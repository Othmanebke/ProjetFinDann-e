"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { BarChart2, ExternalLink } from "lucide-react";

const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || "http://localhost:3001";

export default function MetricsPage() {
  return (
    <AppLayout title="Métriques">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">Monitoring Prometheus + Grafana en temps réel</p>
          <a
            href={GRAFANA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir Grafana
          </a>
        </div>

        {/* Grafana embed */}
        <div className="card overflow-hidden" style={{ height: "700px" }}>
          <iframe
            src={`${GRAFANA_URL}/d/smartproject/smartproject-ai?orgId=1&theme=light&kiosk`}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Grafana Dashboard"
            className="w-full h-full"
          />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Prometheus", url: "http://localhost:9090", desc: "Raw metrics & alerting" },
            { title: "Grafana", url: GRAFANA_URL, desc: "Dashboards & visualisation" },
            { title: "Metrics API", url: `${process.env.NEXT_PUBLIC_API_URL}/metrics`, desc: "Prometheus endpoint" },
          ].map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 hover:shadow-md transition-all hover:border-primary-300 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="h-4 w-4 text-primary-500" />
                <span className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600">{link.title}</span>
                <ExternalLink className="h-3 w-3 text-slate-400 ml-auto" />
              </div>
              <p className="text-xs text-slate-400">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
