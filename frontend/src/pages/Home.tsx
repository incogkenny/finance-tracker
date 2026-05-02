import { useState, useEffect, type FormEvent } from "react";
import api from "../api";
import type { AxiosError } from "axios";
import Transaction from "../components/Transaction.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
};
type Transaction = {
  id: number;
  transaction_type: string;
  category_id: number | null;
  amount: number;
  notes: string;
  date: string;
  created: string;
};

function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>("none");
  const [notes, setNotes] = useState<string>("");
  const [type, setType] = useState<string>("INCOME");
  const [amount, setAmount] = useState<string>("");
  const today = () => new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today());
  const [sheetOpen, setSheetOpen] = useState(false);

  const getTransactions = () => {
    api
      .get("/api/transactions/")
      .then((res) => setTransactions(res.data))
      .catch((error: AxiosError) => toast.error("Failed to load transactions", { description: error.message }));
  };

  const getCategories = () => {
    api
      .get("/api/categories/")
      .then((res) => setCategories(res.data))
      .catch((error) => console.error("Failed to load categories:", error));
  };

  const deleteTransaction = (id: number) => {
    api
      .delete(`/api/transactions/${id}/`)
      .then((res) => {
        if (res.status === 204) getTransactions();
        else toast.error("Failed to delete transaction");
      })
      .catch((error: AxiosError) => toast.error("Failed to delete transaction", { description: error.message }));
  };

  const createTransaction = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      transaction_type: type,
      category_id: category === "none" ? null : Number(category),
      amount: amount === "" ? null : parseFloat(amount),
      date,
      notes,
    };
    try {
      const res = await api.post("/api/transactions/", payload);
      if (res.status === 201) {
        setSheetOpen(false);
        setAmount("");
        setDate(today());
        setNotes("");
        setCategory("none");
        setType("INCOME");
        getTransactions();
      }
    } catch (err) {
      toast.error("Failed to create transaction");
      console.error(err);
    }
  };

  useEffect(() => {
    getTransactions();
    getCategories();
  }, []);

  const categoryName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date().toLocaleString("en-GB", { month: "long", year: "numeric" });
  const fmt = (n: number) =>
    `£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalBalance = transactions.reduce(
    (sum, t) => sum + (t.transaction_type === "INCOME" ? Number(t.amount) : -Number(t.amount)),
    0
  );
  const incomeThisMonth = transactions
    .filter((t) => t.transaction_type === "INCOME" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expensesThisMonth = transactions
    .filter((t) => t.transaction_type === "EXPENSE" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalBalance < 0 ? "-" : ""}{fmt(totalBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">{fmt(incomeThisMonth)}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">{fmt(expensesThisMonth)}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">Transactions</h2>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <PlusIcon className="size-4 mr-1" />
                Add Transaction
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Transaction</SheetTitle>
                <SheetDescription>
                  Record a new income or expense transaction.
                </SheetDescription>
              </SheetHeader>
              <form
                onSubmit={createTransaction}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto space-y-4 px-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="No category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                        £
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        min="0.00"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <SheetFooter className="border-t px-4 py-4 gap-2">
                  <SheetClose asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button type="submit" className="flex-1">
                    Add Transaction
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No transactions yet. Add one to get started.
                </td>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <Transaction
                  key={transaction.id}
                  transaction={transaction}
                  categoryName={categoryName(transaction.category_id)}
                  onDelete={deleteTransaction}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Home;
