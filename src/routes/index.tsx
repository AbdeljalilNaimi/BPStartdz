import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type { ParsedBP } from '@/lib/bp-types';
import { FileUploader } from '@/components/bp/file-uploader';
import { Dashboard } from '@/components/bp/dashboard';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const [bp, setBp] = useState<ParsedBP | null>(null);

  if (!bp) return <FileUploader onParsed={setBp} />;
  return <Dashboard bp={bp} onReset={() => setBp(null)} />;
}
