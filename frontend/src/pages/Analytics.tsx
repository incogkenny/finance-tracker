import { PieChart } from "lucide-react";

export function Analytics() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="rounded-full bg-muted p-4">
        <PieChart className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Spending charts and insights are coming soon.
        </p>
      </div>
    </div>
  );
}
