import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import api from "@/api.ts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters long")
});


type Props = {
  onCreated?: () => void;
};

function CategoryForm({ onCreated }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });

  const createCategory = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await api.post("/api/categories/", { name: data.name });
      if (response.status === 201) {
        toast.success("Category created");
        form.reset();
        onCreated?.();
      } else {
        toast.error("Failed to create category");
      }
    } catch (err) {
      toast.error("Failed to create category");
      console.error(err);
    }
  };

  return (
    <Card className={"w-full sm:max-w-md"}>
      <CardHeader>
        <CardTitle>Add Category</CardTitle>
        <CardDescription>Create a new category used to sort transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={"category-form"} onSubmit={form.handleSubmit(createCategory)}>
          <FieldGroup>
            <Controller name={"name"} control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={"category-form-title"}>Category Name</FieldLabel>
                <Input
                  {...field}
                  id={"category-form-title"}
                  aria-invalid={fieldState.invalid}
                  placeholder={"Shopping"}
                  autoComplete={"off"}
                >
                </Input>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}>
            </Controller>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button type={"submit"} form={"category-form"}>Create</Button>
        </Field>
      </CardFooter>
    </Card>
  );


}

export default CategoryForm;

