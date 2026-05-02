import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";

type TransactionData = {
  id: number;
  transaction_type: string;
  category_id: number | null;
  amount: number;
  notes: string;
  date: string;
};
type Props = {
  transaction: TransactionData;
  categoryName: string;
  onDelete: (id: number) => void;
};

function Transaction({ transaction, categoryName, onDelete }: Props) {
  const isIncome = transaction.transaction_type === "INCOME";

  return (
    <TableRow>
      <TableCell className="text-sm text-muted-foreground">
        {transaction.date}
      </TableCell>
      <TableCell>
        <Badge variant={isIncome ? "default" : "destructive"}>
          {isIncome ? "Income" : "Expense"}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{categoryName}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {transaction.notes || "—"}
      </TableCell>
      <TableCell
        className={`text-right font-medium ${isIncome ? "text-green-600" : "text-red-600"}`}
      >
        {isIncome ? "+" : "-"}£{Number(transaction.amount).toFixed(2)}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(transaction.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default Transaction;
