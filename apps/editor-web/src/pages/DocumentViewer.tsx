import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, CircularProgress } from '@pdfplatform/ui';
import { reopenDocument } from '@/lib/pdfLib';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { EditorLayout } from '@/components/layout/EditorLayout';

export function DocumentViewer(): React.ReactElement {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { document, loading } = usePdfDocument();
  const [resolved, setResolved] = React.useState(false);

  React.useEffect(() => {
    const documentId = params.get('d');
    if (!documentId) {
      if (!document) {
        navigate('/', { replace: true });
      }
      setResolved(true);
      return;
    }
    let cancelled = false;
    const open = async (): Promise<void> => {
      if (document?.documentId === documentId) {
        setResolved(true);
        return;
      }
      try {
        await reopenDocument(documentId);
      } catch {
        if (!cancelled) {
          navigate('/', { replace: true });
        }
      } finally {
        if (!cancelled) {
          setResolved(true);
        }
      }
    };
    void open();
    return () => {
      cancelled = true;
    };
  }, [params, document, navigate]);

  if (loading || !resolved) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-100 dark:bg-slate-950">
        <CircularProgress ariaLabel="Opening document" size={48} />
        <p className="text-sm text-slate-500 dark:text-slate-400">Opening document…</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-100 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">This document is no longer available.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </div>
    );
  }

  return <EditorLayout />;
}
