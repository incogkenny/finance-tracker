import { Activity } from "lucide-react";

export function Transactions() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="rounded-full bg-muted p-4">
        <Activity className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <p className="text-sm text-muted-foreground">
          A dedicated transactions view with filtering and sorting is coming soon.
        </p>
      </div>
    </div>
  );
}
