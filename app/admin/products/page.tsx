import { prisma } from "@/lib/prisma";
import { createCategoryAction, createProductAction, deleteProductAction } from "@/app/actions/admin";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImagePicker } from "@/components/admin/product-image-picker";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Product management</h2>
        <p className="mt-1 text-sm text-muted-foreground">Add categories, upload products, and manage inventory.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardContent className="space-y-3 p-5">
            <p className="font-medium text-foreground">Create category</p>
            <form action={createCategoryAction} className="space-y-3">
              <Input name="name" required placeholder="Category name" />
              <Textarea name="description" placeholder="Description" />
              <Button>Create category</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="space-y-3 p-5">
            <p className="font-medium text-foreground">Add product</p>
            <form action={createProductAction} className="space-y-3">
              <Input name="name" required placeholder="Product name" />
              <Textarea name="description" required placeholder="Description" />
              <div className="grid grid-cols-2 gap-3">
                <Input name="price" type="number" step="0.01" required placeholder="Price" />
                <Input name="quantity" type="number" required placeholder="Quantity" />
              </div>
              <Select name="categoryId" required defaultValue="">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input name="sizes" required placeholder="Sizes (comma-separated)" />
              <ProductImagePicker />
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input name="featured" type="checkbox" className="rounded border-input" /> Featured product
              </label>
              <Button>Create product</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Stock</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="p-3 text-foreground">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.category.name}</td>
                  <td className="p-3 text-foreground">{formatCurrency(Number(p.price))}</td>
                  <td className="p-3 text-muted-foreground">{p.quantity}</td>
                  <td className="p-3 text-right">
                    <form action={deleteProductAction.bind(null, p.id)}>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
