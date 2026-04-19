import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseBPFile, BPParseError } from '@/lib/bp-parser';
import type { ParsedBP } from '@/lib/bp-types';

interface Props {
  onParsed: (bp: ParsedBP) => void;
}

export function FileUploader({ onParsed }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.name.match(/\.(xlsx|xlsm|xls)$/i)) {
      setError('Format non supporté. Veuillez charger un fichier .xlsx');
      return;
    }
    setLoading(true);
    try {
      const bp = await parseBPFile(file);
      onParsed(bp);
    } catch (e) {
      if (e instanceof BPParseError) {
        setError(`Feuille manquante : « ${e.sheetName} ». ${e.message}`);
      } else {
        setError(`Erreur de lecture : ${e instanceof Error ? e.message : String(e)}`);
      }
    } finally {
      setLoading(false);
    }
  }, [onParsed]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Tableau de bord BP</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Analyse interactive des Business Plans au format ASF BP Canevas (DZD)
          </p>
        </div>

        <Card
          className={`border-2 border-dashed transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <CardContent className="py-12 sm:py-16 flex flex-col items-center text-center gap-4">
            {loading ? (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Analyse du fichier en cours…</p>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
                  <Upload className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Glissez-déposez votre fichier .xlsx ici</p>
                  <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir</p>
                </div>
                <Button onClick={() => inputRef.current?.click()} variant="default">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Choisir un fichier
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xlsm,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Structure attendue : feuilles B.1. P&amp;L, B.2. TFT, B.3 Actif immo &amp; BFR, B.4 Bilan,</p>
          <p>C. Synthèse Financement, A.1–A.6, Hypothèses de base.</p>
          <p className="pt-2">🔒 Le fichier est analysé localement dans votre navigateur — il n'est pas envoyé sur un serveur.</p>
        </div>
      </div>
    </div>
  );
}
