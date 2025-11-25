import "../styles/Transaction.css";

type TransactionData = {
  id: number;
  transaction_type: string;
  category_id: number;
  amount: number;
  notes: string;
  date: string;
  created: string;
};
type Props = {
  transaction: TransactionData;
  onDelete: (id: number) => void;
};

function Transaction({ transaction, onDelete }: Props) {
  return (
    <div className="transaction-container">
      <p className={"transaction-notes"}>{transaction.notes}</p>
      <p className={"transaction-type"}>{transaction.transaction_type}</p>
      <p className={"transaction-category"}>{transaction.category_id}</p>
      <p className={"transaction-amount"}>{transaction.amount}</p>
      <p className={"transaction-date"}>{transaction.date}</p>
      <button
        className={"delete-button"}
        onClick={() => {
          onDelete(transaction.id);
        }}
      >
        Delete
      </button>
    </div>
  );
}
export default Transaction;
