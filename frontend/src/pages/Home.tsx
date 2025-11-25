import { useState, useEffect, type FormEvent } from "react";
import api from "../api";
import type { AxiosError } from "axios";

type Category = {
  id: number;
  name: string;
};

function Home() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<number | string>("");
  const [note, setNote] = useState<string>("");
  const [type, setType] = useState<string>("INCOME");
  const [amount, setAmount] = useState<string | number>("");
  const [date, setDate] = useState<string>("");

  const getTransactions = () => {
    api
      .get("/api/transactions/")
      .then((response) => response.data)
      .then((data) => {
        setTransactions(data);
        console.log(data);
      })
      .catch((error: AxiosError) => alert(error));
  };

  const getCategories = () => {
    api
      .get("/api/categories/")
      .then((response) => response.data)
      .then((data: Category[]) => {
        setCategories(data);
        console.log(data);
      })
      .catch((error) => console.error("Failed to load categories: " + error));
  };

  const deleteTransaction = (id: string) => {
    api
      .delete(`/api/transactions/${id}/`)
      .then((response) => {
        if (response.status === 204) alert("Transaction deleted");
        else alert("Failed to delete transaction");
        getTransactions();
      })
      .catch((error: AxiosError) => {
        alert(error);
      });
  };

  const createTransaction = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      transaction_type: type, // match serializer field
      category_id: category === "" ? null : Number(category), // null if none
      amount: amount === "" ? null : parseFloat(amount), // numeric
      date,
      notes: note, // match serializer field
    };

    try {
      const response = await api.post("/api/transactions/", payload);
      if (response.status === 201) alert("Transaction created");
      else alert("Failed to create transaction");
    } catch (err) {
      // show validation errors returned from DRF
      console.log(err);
    } finally {
      getTransactions();
    }
  };

  useEffect(() => {
    getTransactions();
    getCategories();
  }, []);

  return (
    <div>
      <h2>Transactions</h2>
      <h2>Add Transaction</h2>
      <form onSubmit={createTransaction}>
        <label htmlFor={"type"}>Type: </label>
        <br />
        <select
          id={"type"}
          defaultValue={"INCOME"}
          required={true}
          onChange={(e) => setType(e.target.value)}
        >
          <option value={"INCOME"}>Income</option>
          <option value={"EXPENSE"}>Expense</option>
        </select>

        <br />

        <label htmlFor={"category"}>Category: </label>
        <br />
        <select
          id={"category"}
          value={category ?? ""}
          onChange={(e) =>
            setCategory(e.target.value === "" ? "" : Number(e.target.value))
          }
        >
          <option value={""}>No Category (optional)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <br />

        <label htmlFor={"amount"}>Amount:</label>
        <br />
        <input
          type={"number"}
          min={"0.00"}
          max={"1000000000.00"}
          id={"amount"}
          required={true}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <br />

        <label htmlFor={"date"}>Date:</label>
        <br />
        <input
          type={"date"}
          id={"date"}
          required={true}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <br />

        <label htmlFor={"note"}>Notes:</label>
        <br />
        <textarea
          id={"note"}
          required={false}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <br />
        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
}

export default Home;
