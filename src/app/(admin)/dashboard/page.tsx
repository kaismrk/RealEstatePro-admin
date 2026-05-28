"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SystemMetrics, ServiceStatus, Alert } from "@/lib/types";
import {
  Users,
  Activity,
  Clock,
  AlertTriangle,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

function MetricCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
        {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      </CardContent>
    </Card>
  );
}

function ServiceStatusBadge({ status }: { status: string }) {
  if (status === "healthy")
    return <Badge variant="success">Healthy</Badge>;
  if (status === "degraded")
    return <Badge variant="warning">Degraded</Badge>;
  return <Badge variant="destructive">Down</Badge>;
}

function AlertSeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical")
    return <XCircle className="h-4 w-4 text-red-600" />;
  if (severity === "error")
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (severity === "warning")
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  return <CheckCircle className="h-4 w-4 text-primary-500" />;
}

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin", "metrics", "system"],
    queryFn: async () => {
      const res = await adminApi.getSystemMetrics();
      return res.data as SystemMetrics;
    },
    refetchInterval: 60_000,
  });

  const { data: services } = useQuery({
    queryKey: ["admin", "service-status"],
    queryFn: async () => {
      const res = await adminApi.getServiceStatus();
      return res.data as ServiceStatus[];
    },
    refetchInterval: 60_000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["admin", "alerts"],
    queryFn: async () => {
      const res = await adminApi.getAlerts();
      return res.data as Alert[];
    },
    refetchInterval: 30_000,
  });

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse rounded bg-neutral-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        {metrics?.last_updated && (
          <p className="text-xs text-neutral-400">
            Last updated: {new Date(metrics.last_updated).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Users"
          value={metrics?.active_users ?? 0}
          icon={Users}
          description="Currently online"
        />
        <MetricCard
          title="API Requests/min"
          value={metrics ? Math.round(metrics.api_requests_rate) : 0}
          icon={Activity}
          description={`Total: ${metrics?.api_requests_total.toLocaleString() ?? 0}`}
        />
        <MetricCard
          title="Avg Response Time"
          value={metrics ? `${Math.round(metrics.average_response_time)}ms` : "—"}
          icon={Clock}
          description={`Error rate: ${metrics?.error_rate.toFixed(2) ?? 0}%`}
        />
        <MetricCard
          title="Uptime"
          value={metrics ? `${metrics.uptime_days.toFixed(1)}d` : "—"}
          icon={Server}
          description={`${metrics?.active_deployments ?? 0}/${metrics?.total_deployments ?? 0} deployments active`}
        />
      </div>

      {/* Resource usage */}
      {metrics?.resources && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {(
                [
                  ["CPU", metrics.resources.cpu_percent],
                  ["Memory", metrics.resources.memory_percent],
                  ["Disk", metrics.resources.disk_usage_percent],
                ] as [string, number][]
              ).map(([label, pct]) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{label}</span>
                    <span className="font-medium">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-200">
                    <div
                      className={`h-2 rounded-full ${
                        pct > 80
                          ? "bg-red-500"
                          : pct > 60
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Service status */}
        {services && services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{svc.name}</p>
                      {svc.message && (
                        <p className="text-xs text-neutral-500">{svc.message}</p>
                      )}
                    </div>
                    <ServiceStatusBadge status={svc.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active alerts */}
        {alerts && (
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts ({alerts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-sm text-neutral-500">No active alerts</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 rounded-md border border-neutral-100 p-3"
                    >
                      <AlertSeverityIcon severity={alert.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800">{alert.title}</p>
                        <p className="text-xs text-neutral-500">{alert.message}</p>
                        {alert.country_code && (
                          <span className="mt-1 inline-block text-xs text-neutral-400">
                            [{alert.country_code}]
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
