import api from "@/api";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import CategoryForm from "@/components/CategoryForm.tsx";

type Category = {
  id: number;
  name: string;
};

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const getCategories = () => {
    api
      .get("/api/categories/")
      .then((res) => setCategories(res.data))
      .catch((error: AxiosError) => console.error("Failed to load categories:", error));
  };

  const deleteCategory = (id: number) => {
    api
      .delete(`/api/category/${id}/`)
      .then((res) => {
        if (res.status === 204) getCategories();
        else toast.error("Failed to delete category");
      })
      .catch((error: AxiosError) => toast.error("Failed to delete category", { description: error.message }));
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Categories</h2>
        </div>
        {categories.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No categories yet. Create one below.
          </p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteCategory(category.id)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CategoryForm onCreated={getCategories} />
    </div>
  );
}
