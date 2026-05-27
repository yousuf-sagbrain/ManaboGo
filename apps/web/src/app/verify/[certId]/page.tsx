/**
 * /verify/[certId] — Certificate Verification (ISR)
 * Public page — no auth required. Fully crawlable.
 * Revalidates every hour.
 */

import type { Metadata } from "next";

export const revalidate = 3600; // ISR: rebuild cached page every hour

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface PageProps {
  params: Promise<{ certId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certId } = await params;
  return {
    title: `ManaboGo Certificate #${certId}`,
    description: `Verify the authenticity of ManaboGo JLPT N5 certificate ${certId}.`,
    robots: { index: true, follow: true },
  };
}

interface Certificate {
  id: string;
  learner_name: string;
  score: number;
  issued_at: string;
  revoked: boolean;
}

async function fetchCertificate(certId: string): Promise<Certificate | null> {
  try {
    const resp = await fetch(`${API_URL}/certificates/${certId}`, {
      next: { revalidate: 3600 },
    });
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { certId } = await params;
  const cert = await fetchCertificate(certId);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-sakura font-display">ManaboGo</a>
        </div>

        {cert && !cert.revoked ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            {/* Valid banner */}
            <div className="bg-jade/10 border border-jade/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-jade font-bold text-lg">✅ This certificate is valid</p>
            </div>

            {/* Certificate details */}
            <div className="space-y-4">
              <DetailRow label="Certificate number" value={cert.id} mono />
              <DetailRow label="Issued to" value={cert.learner_name} />
              <DetailRow
                label="Issued on"
                value={new Date(cert.issued_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              <DetailRow label="Score" value={`${cert.score}%`} />
              <DetailRow label="Qualification" value="JLPT N5 — ManaboGo Accredited" />
            </div>

            {/* Seal */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <svg className="w-4 h-4 text-jade" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified by ManaboGo · {new Date().getFullYear()}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              ❌ Certificate not found or has been revoked
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Certificate ID: <span className="font-mono text-slate-700">{certId}</span>
            </p>
            <p className="text-sm text-slate-400">
              If you believe this is an error, please contact{" "}
              <a href="mailto:support@manabogo.app" className="text-indigo-600 hover:underline">
                support@manabogo.app
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-slate-900 text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
