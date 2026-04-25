import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Sparkles, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { parseBPFile, BPParseError } from '@/lib/bp-parser';
import { usePlanStore } from '@/lib/plan-store';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Plan Financier — Choisir une option' },
      { name: 'description', content: "Construisez votre Business Plan : importez un fichier Excel existant ou créez un plan personnalisé étape par étape." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const loadFromParsedBP = usePlanStore((s) => s.loadFromParsedBP);
  const reset = usePlanStore((s) => s.reset);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.match(/\.(xlsx|xlsm|xls)$/i)) {
      setError('Format non supporté. Veuillez charger un fichier .xlsx');
      return;
    }
    setUploading(true);
    try {
      const bp = await parseBPFile(file);
      loadFromParsedBP(bp);
      navigate({ to: '/plan/identification' });
    } catch (e) {
      if (e instanceof BPParseError) setError(`Feuille manquante : « ${e.sheetName} »`);
      else setError(`Erreur de lecture : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Plan Financier</p>
            <p className="text-xs text-muted-foreground">Outil de planification académique</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Construisez votre Business Plan
            </h1>
            <p className="text-muted-foreground">
              Choisissez votre point de départ. Nous vous guidons à travers chaque étape, et tous les états financiers sont calculés automatiquement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload card */}
            <Card className="group relative overflow-hidden border-border/60 hover:border-primary/40 transition-all">
              <CardContent className="p-8 space-y-5">
                <div className="h-12 w-12 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Importer un fichier Excel</h2>
                  <p className="text-sm text-muted-foreground">
                    Vous avez déjà un Business Plan au format ASF BP Canevas (.xlsx) ? Importez-le pour pré-remplir tous les champs.
                  </p>
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept=".xlsx,.xlsm,.xls"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                  <Button asChild variant="outline" className="w-full cursor-pointer" disabled={uploading}>
                    <span>
                      {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      {uploading ? 'Analyse en cours…' : 'Choisir un fichier .xlsx'}
                    </span>
                  </Button>
                </label>
                {error && (
                  <div className="flex gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create card */}
            <Card className="group relative overflow-hidden border-primary/30 bg-accent/40 hover:border-primary/60 transition-all">
              <CardContent className="p-8 space-y-5">
                <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Créer un plan personnalisé</h2>
                  <p className="text-sm text-muted-foreground">
                    Démarrez de zéro avec un parcours guidé. Saisissez uniquement les données nécessaires, le reste est calculé automatiquement.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    reset();
                    navigate({ to: '/plan/identification' });
                  }}
                >
                  Commencer maintenant
                </Button>
                <p className="text-xs text-muted-foreground">
                  Vos données sont sauvegardées localement dans votre navigateur. <Link to="/plan/identification" className="underline">Reprendre un plan en cours</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        Année de référence par défaut : 2026 · Devise : DZD
      </footer>
    </div>
  );
}
