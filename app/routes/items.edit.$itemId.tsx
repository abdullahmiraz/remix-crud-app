import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  MetaFunction,
} from "@remix-run/react";
import { Item } from "~/model/item.server";
import { connectDB } from "~/utils/db.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.item) {
    return [
      { title: "Item Not Found | Remix Items App" },
      { name: "description", content: "The requested item could not be found" },
    ];
  }

  return [
    { title: `Edit ${data.item.name} | Remix Items App` },
    { name: "description", content: "Edit an existing item" },
  ];
};

export const loader: LoaderFunction = async ({ params }) => {
  console.log("Edit route params:", params);
  try {
    await connectDB();
    const item = await Item.findById(params.itemId);

    if (!item) {
      throw new Response("Item not found", { status: 404 });
    }

    return json({ item });
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response("Error loading item", { status: 500 });
  }
};

type ActionData = {
  error?: string;
  fieldErrors?: {
    name?: string;
    description?: string;
  };
  fields?: {
    name: string;
    description?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  try {
    await connectDB();
    const form = await request.formData();
    const name = form.get("name");
    const description = form.get("description");

    const fieldErrors: ActionData["fieldErrors"] = {};
    if (typeof name !== "string" || name.trim().length === 0) {
      fieldErrors.name = "Name is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return json<ActionData>({
        fieldErrors,
        fields: {
          name: typeof name === "string" ? name : "",
          description: typeof description === "string" ? description : "",
        },
      });
    }

    const item = await Item.findByIdAndUpdate(
      params.itemId,
      { name, description },
      { new: true }
    );

    if (!item) {
      throw new Response("Item not found", { status: 404 });
    }

    return redirect(`/items/${item._id}`);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Error updating item:", error);
    return json<ActionData>(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
};

export default function EditItem() {
  const { item } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Item</h1>
        <Link
          to={`/items/${item._id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Item
        </Link>
      </div>

      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name:
          </label>
          <input
            name="name"
            defaultValue={actionData?.fields?.name ?? item.name}
            required
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              actionData?.fieldErrors?.name
                ? "border-red-300"
                : "border-gray-300"
            }`}
          />
          {actionData?.fieldErrors?.name && (
            <p className="mt-1 text-sm text-red-600">
              {actionData.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description:
          </label>
          <textarea
            name="description"
            defaultValue={actionData?.fields?.description ?? item.description}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Update Item
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm("Are you sure you want to delete this item?")) {
              fetch(`/items/${item._id}`, {
                method: "DELETE",
              }).then(() => {
                window.location.href = "/";
              });
            }
          }}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}
