"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pbi from "powerbi-client";
import type { EmbedConfig, PageInfo } from "@/types";

interface UsePowerBIEmbedReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  report: pbi.Report | null;
  loading: boolean;
  error: string | null;
  pages: PageInfo[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  refreshPages: () => Promise<void>;
}

export function usePowerBIEmbed(): UsePowerBIEmbedReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [report, setReport] = useState<pbi.Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    const embedReport = async () => {
      try {
        const response = await fetch("/api/powerbi");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch embed config");
        }

        const config: EmbedConfig = await response.json();

        if (!containerRef.current) return;

        const waitForPowerBI = (): Promise<pbi.service.Service> => {
          return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            const interval = setInterval(() => {
              if (window.powerbi) {
                clearInterval(interval);
                resolve(window.powerbi);
              } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error("Power BI library failed to load"));
              }
              attempts++;
            }, 100);
          });
        };

        const powerbi = await waitForPowerBI();

        const embedConfiguration: pbi.IEmbedConfiguration = {
          type: "report",
          tokenType: pbi.models.TokenType.Embed,
          accessToken: config.embedToken,
          embedUrl: config.embedUrl,
          id: config.reportId,
          permissions: pbi.models.Permissions.All,
          viewMode: pbi.models.ViewMode.View,
          settings: {
            layoutType: pbi.models.LayoutType.Master,
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: false },
              fields: { expanded: false },
              visualizations: { expanded: false },
            },
            bars: {
              actionBar: { visible: true },
            },
            background: pbi.models.BackgroundType.Transparent,
            extensions: [
              {
                command: {
                  name: "editVisual",
                  title: "Edit Visual",
                  extend: {
                    visualOptionsMenu: {
                      title: "Edit Visual",
                      menuLocation: pbi.models.MenuLocation.Top,
                    },
                    visualContextMenu: {
                      title: "Edit Visual",
                      menuLocation: pbi.models.MenuLocation.Top,
                    },
                  },
                },
              },
              {
                command: {
                  name: "deleteVisual",
                  title: "Delete Visual",
                  extend: {
                    visualOptionsMenu: {
                      title: "Delete Visual",
                      menuLocation: pbi.models.MenuLocation.Bottom,
                    },
                    visualContextMenu: {
                      title: "Delete Visual",
                      menuLocation: pbi.models.MenuLocation.Bottom,
                    },
                  },
                },
              },
            ],
          },
        };

        const embeddedReport = powerbi.embed(
          containerRef.current,
          embedConfiguration
        ) as pbi.Report;

        window.report = embeddedReport;
        setReport(embeddedReport);

        embeddedReport.on("loaded", async () => {
          setLoading(false);

          try {
            const reportPages = await embeddedReport.getPages();
            const pageList = reportPages.map((p) => ({
              name: p.name,
              displayName: p.displayName,
            }));
            setPages(pageList);

            const activePage = reportPages.find((p) => p.isActive);
            if (activePage) {
              const activeIndex = pageList.findIndex((p) => p.name === activePage.name);
              setCurrentPageIndex(activeIndex >= 0 ? activeIndex : 0);
            }
          } catch {}
        });

        embeddedReport.on("error", (event) => {
          const errorDetail = event.detail as { message?: string };
          setError(errorDetail?.message || "An error occurred");
          setLoading(false);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    embedReport();

    return () => {
      window.report = null;
    };
  }, []);

  const refreshPages = useCallback(async () => {
    if (!report) return;

    try {
      const reportPages = await report.getPages();
      const pageList = reportPages.map((p) => ({
        name: p.name,
        displayName: p.displayName,
      }));
      setPages(pageList);

      const activePage = reportPages.find((p) => p.isActive);
      if (activePage) {
        const activeIndex = pageList.findIndex((p) => p.name === activePage.name);
        if (activeIndex >= 0) {
          setCurrentPageIndex(activeIndex);
        }
      }
    } catch {}
  }, [report]);

  return {
    containerRef,
    report,
    loading,
    error,
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    refreshPages,
  };
}
