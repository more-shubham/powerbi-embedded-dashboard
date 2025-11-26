import { NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";

const msalConfig = {
  auth: {
    clientId: process.env.POWERBI_CLIENT_ID!,
    clientSecret: process.env.POWERBI_CLIENT_SECRET!,
    authority: `${process.env.POWERBI_AUTHORITY_URL}${process.env.POWERBI_TENANT_ID}`,
  },
};

const powerbiApiUrl = "https://api.powerbi.com/v1.0/myorg";

async function getAccessToken(): Promise<string> {
  const cca = new ConfidentialClientApplication(msalConfig);

  const result = await cca.acquireTokenByClientCredential({
    scopes: [process.env.POWERBI_SCOPE!],
  });

  if (!result?.accessToken) {
    throw new Error("Failed to acquire access token");
  }

  return result.accessToken;
}

async function getEmbedToken(
  accessToken: string,
  workspaceId: string,
  reportId: string,
  datasetId?: string
) {
  const response = await fetch(`${powerbiApiUrl}/GenerateToken`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      datasets: datasetId ? [{ id: datasetId }] : [],
      reports: [
        {
          id: reportId,
          allowEdit: true,
          allowCreate: true,
        },
      ],
      targetWorkspaces: [{ id: workspaceId }],
      lifetimeInMinutes: 60,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get embed token: ${errorText}`);
  }

  return response.json();
}

async function getReportDetails(accessToken: string, workspaceId: string, reportId: string) {
  const response = await fetch(`${powerbiApiUrl}/groups/${workspaceId}/reports/${reportId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get report details: ${errorText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const workspaceId = process.env.POWERBI_WORKSPACE_ID;
    const reportId = process.env.POWERBI_REPORT_ID;

    if (!workspaceId || !reportId) {
      return NextResponse.json({ error: "Power BI configuration is missing" }, { status: 500 });
    }

    const accessToken = await getAccessToken();

    const reportDetails = await getReportDetails(accessToken, workspaceId, reportId);

    const embedToken = await getEmbedToken(
      accessToken,
      workspaceId,
      reportId,
      reportDetails.datasetId
    );

    return NextResponse.json({
      embedToken: embedToken.token,
      embedUrl: reportDetails.embedUrl,
      reportId: reportDetails.id,
      reportName: reportDetails.name,
      datasetId: reportDetails.datasetId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
