/**
 * 用户IP信息组件
 * 
 * @author xxh
 * @date 2025-09-21
 */

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface IpInfo {
  ip_addr: string;
  user_agent: string;
  port: string;
  method: string;
  encoding: string;
  mime: string;
  via: string;
  forwarded: string;
}

export function UserIpInfo() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIpInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://ifconfig.me/all.json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setIpInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取IP信息失败");
        console.error("获取IP信息时出错:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIpInfo();
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-medium">访客信息</h3>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">无法获取IP信息: {error}</div>
        ) : ipInfo ? (
          <div className="text-sm space-y-1">
            <p className="flex justify-between">
              <span className="text-muted-foreground">IP地址:</span>
              <span className="font-medium">{ipInfo.ip_addr}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">端口:</span>
              <span>{ipInfo.port}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">请求方式:</span>
              <span>{ipInfo.method}</span>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}