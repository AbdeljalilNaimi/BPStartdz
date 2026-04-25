import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, Loader2, FileText } from 'lucide-react';

export interface PdfSection {
  key: string;
  label: string;
}

interface PdfExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: PdfSection[];
  defaultFileName: string;
  exporting: boolean;
  onConfirm: (selectedKeys: string[], fileName: string) => void;
}

export function PdfExportDialog({
  open,
  onOpenChange,
  sections,
  defaultFileName,
  exporting,
  onConfirm,
}: PdfExportDialogProps) {
  const [selected, setSelected] = useState<string[]>(() => sections.map((s) => s.key));
  const [fileName, setFileName] = useState(defaultFileName);

  const allSelected = selected.length === sections.length;
  const noneSelected = selected.length === 0;

  const toggle = (key: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, key] : prev.filter((k) => k !== key)));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !exporting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Personnaliser l'export PDF
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les sections à inclure dans le rapport. Une page de couverture et un résumé exécutif sont générés automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdf-filename" className="text-xs uppercase tracking-wider text-muted-foreground">
              Nom du fichier
            </Label>
            <Input
              id="pdf-filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="rapport-financier"
              disabled={exporting}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Sections ({selected.length}/{sections.length})
            </Label>
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              disabled={exporting}
              onClick={() => setSelected(allSelected ? [] : sections.map((s) => s.key))}
            >
              {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {sections.map((s) => {
              const checked = selected.includes(s.key);
              const id = `pdf-section-${s.key}`;
              return (
                <div
                  key={s.key}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/60 hover:bg-accent/40 transition-colors"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    disabled={exporting}
                    onCheckedChange={(v) => toggle(s.key, !!v)}
                  />
                  <Label htmlFor={id} className="text-sm font-normal cursor-pointer flex-1 truncate">
                    {s.label}
                  </Label>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Estimation : ~{Math.max(2, selected.length * 2 + 2)} pages (couverture + résumé + sections).
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={exporting}>
            Annuler
          </Button>
          <Button
            disabled={noneSelected || exporting || !fileName.trim()}
            onClick={() => onConfirm(selected, fileName.trim() || 'rapport-financier')}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Générer le PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
