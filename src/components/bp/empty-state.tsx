import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({ message = 'Aucune donnée — veuillez charger un fichier BP complété' }: { message?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  );
}
